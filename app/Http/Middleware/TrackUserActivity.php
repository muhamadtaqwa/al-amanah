<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $userId = Auth::id();
            $now = now()->timestamp;
            $onlineUsers = Cache::get('users_online', []);

            // Hanya perbarui cache jika belum tercatat atau pembaruan terakhir > 60 detik yang lalu
            if (!isset($onlineUsers[$userId]) || ($now - $onlineUsers[$userId]) >= 60) {
                $onlineUsers[$userId] = $now;

                // Bersihkan entri user yang sudah tidak aktif lebih dari 5 menit
                $cutoff = now()->subMinutes(5)->timestamp;
                $onlineUsers = array_filter($onlineUsers, fn($time) => $time >= $cutoff);

                Cache::put('users_online', $onlineUsers, now()->addMinutes(10));
            }
        }

        return $next($request);
    }
}
