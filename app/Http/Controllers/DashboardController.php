<?php

namespace App\Http\Controllers;

use App\Models\Santri;
use App\Models\Ustadz;
use App\Models\User;
use App\Models\Pembayaran;
use App\Models\Login;
use App\Models\Psb;
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

        $aktivitas = $this->getAktivitas();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalSantri'       => Santri::count(),
                'totalUstadz'       => Ustadz::count(),
                'totalBelumBayar'   => $totalBelumBayar,
                'pemasukanBulanIni' => Pembayaran::whereHas('details', function ($q) use ($bulanIni, $tahunIni) {
                    $q->whereMonth('tgl_bayar', $bulanIni)->whereYear('tgl_bayar', $tahunIni);
                })->get()->sum('total_dibayar'),
                'userAktif'         => DB::table('sessions')
                    ->whereNotNull('user_id')
                    ->where('last_activity', '>=', now()->subMinutes(5)->timestamp)
                    ->count(),
                'totalUser'         => User::count(),
                'kunjunganHariIni'  => Login::whereDate('created_at', today())->count(),
                'totalKunjungan'    => Login::count(),
            ],
            'aktivitas' => $aktivitas,
        ]);
    }

    private function getAktivitas()
    {
        $data = collect();

        // Pembayaran terbaru
        $pembayaran = Pembayaran::with('santri')->latest()->take(5)->get();
        foreach ($pembayaran as $p) {
            $nama = $p->santri->nama_lengkap ?? 'Seseorang';
            $data->push([
                'teks' => $nama . ' membayar ' . $p->jenis,
                'waktu' => $p->created_at->diffForHumans(),
            ]);
        }

        // PSB terbaru
        $psb = Psb::latest()->take(3)->get();
        foreach ($psb as $p) {
            $data->push([
                'teks' => $p->nama_lengkap . ' mendaftar PSB',
                'waktu' => $p->created_at->diffForHumans(),
            ]);
        }

        // Login terbaru
        $logins = Login::with('user.ustadz', 'user.santri')->latest()->take(3)->get();
        foreach ($logins as $l) {
            $nama = 'Seseorang';
            if ($l->user) {
                $nama = $l->user->ustadz->nama_lengkap ?? $l->user->santri->nama_lengkap ?? $l->user->username;
            }
            $data->push([
                'teks' => $nama . ' login',
                'waktu' => $l->created_at->diffForHumans(),
            ]);
        }

        // Urutkan & ambil 5
        return $data->sortByDesc('waktu')->take(5)->values();
    }
}
