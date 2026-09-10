<?php

namespace App\Http\Controllers;

use App\Models\IzinSantri;
use App\Models\Santri;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IzinSantriController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;

        // Kalau santri → hanya lihat izin sendiri
        // Kalau admin → lihat semua izin
        $query = IzinSantri::with('santri')
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->orderBy('tanggal', 'desc');

        if ($user->role === 'santri') {
            $nisSantri = $user->santri->nis;
            $query->where('nis', $nisSantri);
        }

        $izins = $query->get()->map(function ($i) {
            return [
                'id' => $i->id,
                'nis' => $i->nis,
                'nama' => $i->santri->nama_lengkap ?? '-',
                'tanggal' => $i->tanggal,
                'keterangan' => $i->keterangan,
            ];
        });

        return Inertia::render('Izin/Index', [
            'izins' => $izins,
            'bulan' => (int) $bulan,
            'tahun' => (int) $tahun,
            'role' => $user->role,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:500',
        ]);

        $user = auth()->user();

        // Hanya santri yang bisa input izin
        if ($user->role !== 'santri') {
            return back()->withErrors(['error' => 'Hanya santri yang bisa input izin.']);
        }

        $nis = $user->santri->nis;

        // Cek apakah sudah izin di tanggal yang sama
        $sudah = IzinSantri::where('nis', $nis)
            ->where('tanggal', $request->tanggal)
            ->exists();

        if ($sudah) {
            return back()->withErrors(['error' => 'Sudah izin di tanggal tersebut.']);
        }

        IzinSantri::create([
            'nis' => $nis,
            'tanggal' => $request->tanggal,
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
