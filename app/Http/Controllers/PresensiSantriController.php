<?php

namespace App\Http\Controllers;

use App\Models\PresensiSantri;
use App\Models\Santri;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PresensiSantriController extends Controller
{
    public function index(Request $request)
    {
        $tanggal = $request->tanggal ?? now()->format('Y-m-d');

        $presensi = PresensiSantri::with('santri')
            ->whereDate('tanggal', $tanggal)
            ->orderBy('jam', 'asc')
            ->get();

        return Inertia::render('Presensi/Santri', [
            'presensi' => $presensi,
            'tanggal' => $tanggal,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nis' => 'required|exists:santris,nis',
        ]);

        $tanggal = now()->format('Y-m-d');
        $jam = now()->format('H:i:s');

        // Cek double scan
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
