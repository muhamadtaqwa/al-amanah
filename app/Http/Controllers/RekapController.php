<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Santri;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RekapController extends Controller
{
    public function index()
    {
        $rekap = Pembayaran::all()->groupBy('jenis')->map(function ($items) {
            $total = $items->sum('nominal');
            $dibayar = $items->sum('total_dibayar');
            $lunas = $items->filter(fn($i) => $i->status === 'lunas');
            return [
                'jenis' => $items->first()->jenis,
                'total_tagihan' => $items->count(),
                'total_lunas' => $lunas->count(),
                'total_belum' => $items->count() - $lunas->count(),
                'total_nominal' => $total,
                'nominal_lunas' => $dibayar,
                'nominal_belum' => $total - $dibayar,
            ];
        })->values();

        return Inertia::render('Rekap/Index', [
            'rekap' => $rekap,
            'totalSemua' => $rekap->sum('total_nominal'),
            'totalLunas' => $rekap->sum('nominal_lunas'),
            'totalBelum' => $rekap->sum('nominal_belum'),
        ]);
    }

    public function santri()
    {
        $santris = Santri::orderBy('nis')->get();
        return Inertia::render('Rekap/Santri', ['santris' => $santris]);
    }

    public function santriDetailJson($nis)
    {
        $santri = Santri::where('nis', $nis)->first();
        $rekap = Pembayaran::where('nis', $nis)->get()->groupBy('jenis')->map(function ($items) {
            $total = $items->sum('nominal');
            $dibayar = $items->sum('total_dibayar');
            $lunas = $items->filter(fn($i) => $i->status === 'lunas');
            return [
                'jenis' => $items->first()->jenis,
                'total_nominal' => $total,
                'nominal_lunas' => $dibayar,
                'nominal_belum' => $total - $dibayar,
                'total_belum' => $items->count() - $lunas->count(),
            ];
        })->values();

        return response()->json(['santri' => $santri, 'rekap' => $rekap]);
    }

    public function spp()
    {
        $data = Pembayaran::where('jenis', 'SPP')->get()
            ->groupBy('nis')
            ->map(function ($items) {
                $santri = Santri::where('nis', $items->first()->nis)->first();
                $total = $items->sum('nominal');
                $dibayar = $items->sum('total_dibayar');
                $lunas = $items->filter(fn($i) => $i->status === 'lunas');
                return [
                    'nis' => $items->first()->nis,
                    'nama' => $santri->nama_lengkap ?? '-',
                    'total_tagihan' => $items->count(),
                    'total_lunas' => $lunas->count(),
                    'total_belum' => $items->count() - $lunas->count(),
                    'total_nominal' => $total,
                    'nominal_lunas' => $dibayar,
                    'nominal_belum' => $total - $dibayar,
                ];
            })->sortBy('nis')->values();

        return Inertia::render('Rekap/SPP', [
            'rekap' => $data,
            'totalSemua' => $data->sum('total_nominal'),
            'totalLunas' => $data->sum('nominal_lunas'),
            'totalBelum' => $data->sum('nominal_belum'),
        ]);
    }

    public function kitab()
    {
        $data = Pembayaran::where('jenis', 'Kitab')->get()
            ->groupBy('nis')
            ->map(function ($items) {
                $santri = Santri::where('nis', $items->first()->nis)->first();
                $total = $items->sum('nominal');
                $dibayar = $items->sum('total_dibayar');
                $lunas = $items->filter(fn($i) => $i->status === 'lunas');
                return [
                    'nis' => $items->first()->nis,
                    'nama' => $santri->nama_lengkap ?? '-',
                    'total_tagihan' => $items->count(),
                    'total_lunas' => $lunas->count(),
                    'total_belum' => $items->count() - $lunas->count(),
                    'total_nominal' => $total,
                    'nominal_lunas' => $dibayar,
                    'nominal_belum' => $total - $dibayar,
                ];
            })->sortBy('nis')->values();

        return Inertia::render('Rekap/Kitab', [
            'rekap' => $data,
            'totalSemua' => $data->sum('total_nominal'),
            'totalLunas' => $data->sum('nominal_lunas'),
            'totalBelum' => $data->sum('nominal_belum'),
        ]);
    }

    public function kas()
    {
        $data = Pembayaran::where('jenis', 'Kas')->get()
            ->groupBy('nis')
            ->map(function ($items) {
                $santri = Santri::where('nis', $items->first()->nis)->first();
                $total = $items->sum('nominal');
                $dibayar = $items->sum('total_dibayar');
                $lunas = $items->filter(fn($i) => $i->status === 'lunas');

                $perBulan = $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'nama_pembayaran' => $item->nama_pembayaran,
                        'nominal' => $item->nominal,
                        'status' => $item->status,
                        'tgl_bayar' => $item->tgl_bayar,
                    ];
                })->sortBy('nama_pembayaran')->values();

                return [
                    'nis' => $items->first()->nis,
                    'nama' => $santri->nama_lengkap ?? '-',
                    'total_tagihan' => $items->count(),
                    'total_lunas' => $lunas->count(),
                    'total_belum' => $items->count() - $lunas->count(),
                    'total_nominal' => $total,
                    'nominal_lunas' => $dibayar,
                    'nominal_belum' => $total - $dibayar,
                    'per_bulan' => $perBulan,
                ];
            })->sortBy('nis')->values();

        return Inertia::render('Rekap/Kas', [
            'rekap' => $data,
            'totalSemua' => $data->sum('total_nominal'),
            'totalLunas' => $data->sum('nominal_lunas'),
            'totalBelum' => $data->sum('nominal_belum'),
        ]);
    }
}
