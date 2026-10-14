<?php

namespace App\Http\Controllers;

use App\Models\PresensiSantri;
use App\Models\IzinSantri;
use App\Models\Santri;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PresensiSantriController extends Controller
{
    public function index(Request $request)
    {
        $mode = $request->mode ?? 'harian';
        $tanggal = $request->tanggal ?? now()->format('Y-m-d');
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;

        $presensi = PresensiSantri::with('santri')
            ->whereDate('tanggal', $tanggal)
            ->orderBy('jam', 'asc')
            ->get();

        $semuaSantri = Santri::where('status', 'aktif')->orderBy('nama_lengkap')->get();

        $hadir = [];
        $izin = [];
        $tidakHadir = [];
        $rekap = [];

        if ($mode === 'harian') {
            // Data hadir
            $hadir = $presensi->map(function ($p) {
                return [
                    'nis' => $p->nis,
                    'nama' => $p->santri->nama_lengkap ?? '-',
                    'jam' => $p->jam,
                ];
            });

            $hadirNis = $hadir->pluck('nis');

            // Data izin (harian)
            $izinHariIni = IzinSantri::with('santri')
                ->where('tanggal', '<=', $tanggal)
                ->whereRaw('COALESCE(tanggal_selesai, tanggal) >= ?', [$tanggal])
                ->get();

            $izin = $izinHariIni->map(function ($i) {
                return [
                    'id' => $i->id,
                    'nis' => $i->nis,
                    'nama' => $i->santri->nama_lengkap ?? '-',
                    'keterangan' => $i->keterangan,
                ];
            });

            $izinNis = $izin->pluck('nis');

            // Tidak hadir = santri aktif yang tidak hadir & tidak izin
            $tidakHadir = $semuaSantri
                ->whereNotIn('nis', $hadirNis)
                ->whereNotIn('nis', $izinNis)
                ->map(function ($s) {
                    return [
                        'nis' => $s->nis,
                        'nama' => $s->nama_lengkap,
                    ];
                })
                ->values();
        }

        if ($mode === 'mingguan') {
            $startOfWeek = now()->startOfWeek()->format('Y-m-d');
            $endOfWeek = now()->endOfWeek()->format('Y-m-d');

            $presensiMingguan = PresensiSantri::with('santri')
                ->whereBetween('tanggal', [$startOfWeek, $endOfWeek])
                ->get()
                ->groupBy('nis');

            $izinMingguan = IzinSantri::with('santri')
                ->where('tanggal', '<=', $endOfWeek)
                ->whereRaw('COALESCE(tanggal_selesai, tanggal) >= ?', [$startOfWeek])
                ->get();

            $totalHariEfektif = 7;

            $rekap = $semuaSantri->map(function ($s) use ($presensiMingguan, $izinMingguan, $totalHariEfektif, $startOfWeek, $endOfWeek) {
                $itemsHadir = $presensiMingguan->get($s->nis, collect());
                $santriIzins = $izinMingguan->where('nis', $s->nis);

                $izinCount = 0;
                $startW = \Carbon\Carbon::parse($startOfWeek);
                $endW = \Carbon\Carbon::parse($endOfWeek);

                foreach ($santriIzins as $iz) {
                    $izStart = \Carbon\Carbon::parse($iz->tanggal);
                    $izEnd = $iz->tanggal_selesai ? \Carbon\Carbon::parse($iz->tanggal_selesai) : $izStart;

                    $overlapStart = $izStart->greaterThan($startW) ? $izStart : $startW;
                    $overlapEnd = $izEnd->lessThan($endW) ? $izEnd : $endW;

                    if ($overlapStart->lessThanOrEqualTo($overlapEnd)) {
                        $izinCount += $overlapStart->diffInDays($overlapEnd) + 1;
                    }
                }

                $hadir = $itemsHadir->count();
                $izin = $izinCount;
                $tidak = $totalHariEfektif - $hadir - $izin;

                return [
                    'nis' => $s->nis,
                    'nama' => $s->nama_lengkap,
                    'total_hadir' => $hadir,
                    'total_izin' => $izin,
                    'total_tidak' => max(0, $tidak),
                ];
            })->sortBy('nama')->values();
        }

        if ($mode === 'bulanan') {
            $startOfMonth = \Carbon\Carbon::create($tahun, $bulan, 1)->startOfMonth();
            $endOfMonth = \Carbon\Carbon::create($tahun, $bulan, 1)->endOfMonth();
            $totalHari = $startOfMonth->daysInMonth;

            $presensiBulanan = PresensiSantri::with('santri')
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->get()
                ->groupBy('nis');

            $izinBulanan = IzinSantri::with('santri')
                ->where('tanggal', '<=', $endOfMonth->toDateString())
                ->whereRaw('COALESCE(tanggal_selesai, tanggal) >= ?', [$startOfMonth->toDateString()])
                ->get();

            $rekap = $semuaSantri->map(function ($s) use ($presensiBulanan, $izinBulanan, $totalHari, $startOfMonth, $endOfMonth) {
                $itemsHadir = $presensiBulanan->get($s->nis, collect());
                $santriIzins = $izinBulanan->where('nis', $s->nis);

                $izinCount = 0;
                foreach ($santriIzins as $iz) {
                    $izStart = \Carbon\Carbon::parse($iz->tanggal);
                    $izEnd = $iz->tanggal_selesai ? \Carbon\Carbon::parse($iz->tanggal_selesai) : $izStart;

                    $overlapStart = $izStart->greaterThan($startOfMonth) ? $izStart : $startOfMonth;
                    $overlapEnd = $izEnd->lessThan($endOfMonth) ? $izEnd : $endOfMonth;

                    if ($overlapStart->lessThanOrEqualTo($overlapEnd)) {
                        $izinCount += $overlapStart->diffInDays($overlapEnd) + 1;
                    }
                }

                $hadir = $itemsHadir->count();
                $izin = $izinCount;
                $tidak = $totalHari - $hadir - $izin;

                return [
                    'nis' => $s->nis,
                    'nama' => $s->nama_lengkap,
                    'total_hadir' => $hadir,
                    'total_izin' => $izin,
                    'total_tidak' => max(0, $tidak),
                    'terakhir_hadir' => $itemsHadir->max('tanggal'),
                ];
            })->sortBy('nama')->values();
        }

        return Inertia::render('Presensi/Santri', [
            'presensi' => $presensi,
            'tanggal' => $tanggal,
            'mode' => $mode,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'hadir' => $hadir,
            'izin' => $izin,
            'tidakHadir' => $tidakHadir,
            'rekap' => $rekap,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nis' => 'required|exists:santris,nis',
        ]);

        $tanggal = now()->format('Y-m-d');
        $jam = now()->format('H:i:s');

        // Cek apakah santri sedang izin hari ini
        $sudahIzin = IzinSantri::where('nis', $request->nis)
            ->where('tanggal', '<=', $tanggal)
            ->whereRaw('COALESCE(tanggal_selesai, tanggal) >= ?', [$tanggal])
            ->exists();

        if ($sudahIzin) {
            return back()->with('error', 'Santri sedang izin. Batalkan izin dulu untuk presensi.');
        }

        // Cek apakah sudah presensi
        $sudah = PresensiSantri::where('nis', $request->nis)
            ->whereDate('tanggal', $tanggal)
            ->exists();

        if ($sudah) {
            return back()->with('error', 'Santri sudah presensi hari ini.');
        }

        PresensiSantri::create([
            'nis' => $request->nis,
            'tanggal' => $tanggal,
            'jam' => $jam,
        ]);

        return back()->with('success', 'Presensi santri berhasil.');
    }
}
