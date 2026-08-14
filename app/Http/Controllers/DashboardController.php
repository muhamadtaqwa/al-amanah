<?php

namespace App\Http\Controllers;

use App\Models\Santri;
use App\Models\Ustadz;
use App\Models\User;
use App\Models\Pembayaran;
use App\Models\Login;
use App\Models\Psb;
use App\Models\PresensiSantri;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $bulanIni = now()->month;
        $tahunIni = now()->year;

        $pembayaran = Pembayaran::all();
        $totalBelumBayar = $pembayaran->filter(
            fn($p) => $p->status === 'menunggu' || $p->status === 'dicicil'
        )->count();
        $totalSudahBayar = $pembayaran->filter(
            fn($p) => $p->status === 'lunas'
        )->count();

        $aktivitas = $this->getAktivitas();

        $presensiSantri = [];
        if (auth()->user()->role === 'santri') {
            $nis = auth()->user()->santri->nis;
            $presensiSantri = PresensiSantri::where('nis', $nis)
                ->whereMonth('tanggal', $bulanIni)
                ->whereYear('tanggal', $tahunIni)
                ->pluck('tanggal')
                ->toArray();
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalSantri'       => Santri::count(),
                'santriPutra'       => Santri::where('jenis_kelamin', 'laki-laki')->count(),
                'santriPutri'       => Santri::where('jenis_kelamin', 'perempuan')->count(),
                'totalUstadz'       => Ustadz::count(),
                'totalBelumBayar'   => $totalBelumBayar,
                'totalSudahBayar'   => $totalSudahBayar,
                'userAktif'         => DB::table('sessions')
                    ->whereNotNull('user_id')
                    ->where('last_activity', '>=', now()->subMinutes(5)->timestamp)
                    ->count(),
                'totalUser'         => User::count(),
                'kunjunganHariIni'  => Login::whereDate('created_at', today())->count(),
                'totalKunjungan'    => Login::count(),
            ],
            'aktivitas' => $aktivitas,
            'presensiSantri' => $presensiSantri,
        ]);
    }

    private function getAktivitas()
    {
        $data = collect();

        $pembayaran = Pembayaran::with('santri')->latest()->take(10)->get();
        foreach ($pembayaran as $p) {
            $nama = $p->santri->nama_lengkap ?? 'Seseorang';
            $data->push([
                'teks' => $nama . ' membayar ' . $p->jenis,
                'waktu' => $p->created_at,
            ]);
        }

        $psb = Psb::latest()->take(10)->get();
        foreach ($psb as $p) {
            $data->push([
                'teks' => $p->nama_lengkap . ' mendaftar PSB',
                'waktu' => $p->created_at,
            ]);
        }

        $logins = Login::with('user.ustadz', 'user.santri')->latest()->take(10)->get();
        foreach ($logins as $l) {
            $nama = 'Seseorang';
            if ($l->user) {
                if ($l->user->role === 'admin') {
                    $nama = 'Admin Pondok';
                } else {
                    $nama = $l->user->ustadz->nama_lengkap ?? $l->user->santri->nama_lengkap ?? $l->user->username;
                }
            }
            $data->push([
                'teks' => $nama . ' login',
                'waktu' => $l->created_at,
            ]);
        }

        return $data->sortByDesc('waktu')->take(15)->values()->map(function ($item) {
            return [
                'teks' => $item['teks'],
                'waktu' => $item['waktu']->diffForHumans(),
            ];
        });
    }
}
