<?php

namespace App\Http\Controllers;

use App\Models\Tahfidz;
use App\Models\Santri;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TahfidzController extends Controller
{
    public function index(Request $request)
    {
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;

        $santris = Santri::where('status', 'aktif')->orderBy('nis')->get();
        $penyimak = Santri::whereIn('nis', ['PA04', 'PI08', 'PI10', 'PI11'])->get();

        // Data riwayat
        $rekap = Santri::where('status', 'aktif')
            ->orderBy('nis')
            ->get()
            ->map(function ($s) {
                $setoran = Tahfidz::where('nis', $s->nis)
                    ->orderBy('tanggal', 'desc')
                    ->orderBy('id', 'desc')
                    ->first();

                $totalJuz = Tahfidz::where('nis', $s->nis)->max('juz') ?? 0;

                $penyimakNama = $setoran ? Santri::where('nis', $setoran->penyimak)->first()?->nama_lengkap : null;

                return [
                    'nis' => $s->nis,
                    'nama' => $s->nama_lengkap,
                    'juz_terakhir' => $totalJuz,
                    'progress' => round(($totalJuz / 30) * 100, 1),
                    'setoran_terakhir' => $setoran ? [
                        'juz' => $setoran->juz,
                        'surat' => $setoran->surat,
                        'sampai_ayat' => $setoran->sampai_ayat,
                        'tanggal' => $setoran->tanggal,
                        'penyimak' => $penyimakNama ?? $setoran->penyimak,
                        'keterangan' => $setoran->keterangan,
                    ] : null,
                ];
            });

        // Data rekap kalender per bulan
        $rekapBulanan = Santri::where('status', 'aktif')
            ->orderBy('nis')
            ->get()
            ->map(function ($s) use ($bulan, $tahun) {
                $tanggalSetoran = Tahfidz::where('nis', $s->nis)
                    ->whereMonth('tanggal', $bulan)
                    ->whereYear('tanggal', $tahun)
                    ->pluck('tanggal')
                    ->toArray();

                $totalSetoran = count($tanggalSetoran);

                return [
                    'nis' => $s->nis,
                    'nama' => $s->nama_lengkap,
                    'total_setoran' => $totalSetoran,
                    'tanggal_setoran' => $tanggalSetoran,
                ];
            });

        return Inertia::render('Tahfidz/Index', [
            'santris' => $santris,
            'penyimak' => $penyimak,
            'rekap' => $rekap,
            'rekapBulanan' => $rekapBulanan,
            'bulan' => (int) $bulan,
            'tahun' => (int) $tahun,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nis' => 'required|exists:santris,nis',
            'juz' => 'required|integer|min:1|max:30',
            'surat' => 'required|integer|min:1|max:114',
            'sampai_ayat' => 'required|integer|min:1',
            'tanggal' => 'required|date',
            'keterangan' => 'required|in:lanjut,ulang',
            'penyimak' => 'required|exists:santris,nis',
        ]);

        Tahfidz::create($request->all());

        return back()->with('success', 'Setoran tahfidz berhasil dicatat.');
    }

    public function detail($nis)
    {
        $santri = Santri::where('nis', $nis)->first();
        $riwayat = Tahfidz::where('nis', $nis)
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($r) {
                $penyimakNama = Santri::where('nis', $r->penyimak)->first()?->nama_lengkap;
                return [
                    'id' => $r->id,
                    'juz' => $r->juz,
                    'surat' => $r->surat,
                    'sampai_ayat' => $r->sampai_ayat,
                    'tanggal' => $r->tanggal,
                    'keterangan' => $r->keterangan,
                    'penyimak' => $penyimakNama ?? $r->penyimak,
                ];
            });

        return response()->json([
            'santri' => $santri,
            'riwayat' => $riwayat,
        ]);
    }
}
