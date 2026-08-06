<?php

namespace App\Http\Controllers;

use App\Models\Santri;
use App\Models\Ustadz;
use App\Models\User;
use App\Models\Pembayaran;
use App\Models\Login;
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

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalSantri'       => Santri::count(),                              // 1
                'totalUstadz'       => Ustadz::count(),                              // 2
                'totalBelumBayar'   => $totalBelumBayar,                             // 3
                'pemasukanBulanIni' => Pembayaran::whereHas('details', function ($q) use ($bulanIni, $tahunIni) {
                    $q->whereMonth('tgl_bayar', $bulanIni)->whereYear('tgl_bayar', $tahunIni);
                })->get()->sum('total_dibayar'),                                     // 4
                'userAktif'         => DB::table('sessions')
                    ->whereNotNull('user_id')
                    ->where('last_activity', '>=', now()->subMinutes(5)->timestamp)
                    ->count(),                                                       // 5
                'totalUser'         => User::count(),                                // 6
                'kunjunganHariIni'  => Login::whereDate('created_at', today())->count(), // 7
                'totalKunjungan'    => Login::count(),                               // 8
            ],
        ]);
    }
}
