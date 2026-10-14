<?php

namespace App\Http\Controllers;

use App\Models\IzinSantri;
use App\Models\Santri;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class IzinSantriController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $bulan = (int) ($request->bulan ?? now()->month);
        $tahun = (int) ($request->tahun ?? now()->year);

        $startOfMonth = Carbon::create($tahun, $bulan, 1)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::create($tahun, $bulan, 1)->endOfMonth()->toDateString();

        // Kalau santri → hanya lihat izin sendiri
        // Kalau admin → lihat semua izin
        $query = IzinSantri::with('santri')
            ->where('tanggal', '<=', $endOfMonth)
            ->where(function ($q) use ($startOfMonth) {
                $q->where('tanggal_selesai', '>=', $startOfMonth)
                  ->orWhere(function ($sub) use ($startOfMonth) {
                      $sub->whereNull('tanggal_selesai')
                          ->where('tanggal', '>=', $startOfMonth);
                  });
            })
            ->orderBy('tanggal', 'desc');

        if ($user->role === 'santri') {
            $nisSantri = $user->santri->nis;
            $query->where('nis', $nisSantri);
        }

        $izins = $query->get()->map(function ($i) {
            $tglMulai = Carbon::parse($i->tanggal);
            $tglSelesai = $i->tanggal_selesai ? Carbon::parse($i->tanggal_selesai) : $tglMulai;
            $totalHari = $tglMulai->diffInDays($tglSelesai) + 1;

            return [
                'id' => $i->id,
                'nis' => $i->nis,
                'nama' => $i->santri->nama_lengkap ?? '-',
                'tanggal' => $i->tanggal,
                'tanggal_selesai' => $i->tanggal_selesai ?? $i->tanggal,
                'total_hari' => $totalHari,
                'keterangan' => $i->keterangan,
            ];
        });

        return Inertia::render('Izin/Index', [
            'izins' => $izins,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'role' => $user->role,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal',
            'keterangan' => 'required|string|max:500',
        ]);

        $user = auth()->user();

        // Hanya santri yang bisa input izin
        if ($user->role !== 'santri') {
            return back()->withErrors(['error' => 'Hanya santri yang bisa input izin.']);
        }

        $nis = $user->santri->nis;
        $tglMulai = $request->tanggal;
        $tglSelesai = $request->tanggal_selesai ?: $request->tanggal;

        // Cek apakah ada izin yang overlap pada rentang tanggal tersebut
        $sudah = IzinSantri::where('nis', $nis)
            ->where('tanggal', '<=', $tglSelesai)
            ->where(function ($q) use ($tglMulai) {
                $q->where('tanggal_selesai', '>=', $tglMulai)
                  ->orWhere(function ($sub) use ($tglMulai) {
                      $sub->whereNull('tanggal_selesai')
                          ->where('tanggal', '>=', $tglMulai);
                  });
            })
            ->exists();

        if ($sudah) {
            return back()->withErrors(['error' => 'Sudah ada izin yang diajukan pada rentang tanggal tersebut.']);
        }

        IzinSantri::create([
            'nis' => $nis,
            'tanggal' => $tglMulai,
            'tanggal_selesai' => $tglSelesai,
            'keterangan' => $request->keterangan,
        ]);

        return back()->with('success', 'Izin berhasil diajukan.');
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $izin = IzinSantri::findOrFail($id);

        // Santri hanya bisa hapus izin sendiri
        if ($user->role === 'santri') {
            $nisSantri = $user->santri->nis;
            if ($izin->nis !== $nisSantri) {
                return back()->withErrors(['error' => 'Tidak bisa menghapus izin orang lain.']);
            }
        }

        $izin->delete();

        return back()->with('success', 'Izin berhasil dibatalkan.');
    }
}
