<?php

namespace Tests\Feature;

use App\Http\Middleware\TrackUserActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class TrackUserActivityTest extends TestCase
{
    public function test_user_activity_is_tracked_in_cache(): void
    {
        Cache::forget('users_online');

        $user = new User();
        $user->id = 999;
        Auth::setUser($user);

        $middleware = new TrackUserActivity();
        $request = Request::create('/', 'GET');

        $response = $middleware->handle($request, function () {
            return response('OK');
        });

        $this->assertEquals('OK', $response->getContent());

        $onlineUsers = Cache::get('users_online', []);
        $this->assertArrayHasKey(999, $onlineUsers);
        $this->assertGreaterThan(0, $onlineUsers[999]);

        Cache::forget('users_online');
    }

    public function test_expired_users_are_purged(): void
    {
        // 998 is active, 997 is expired (> 5 minutes ago)
        Cache::put('users_online', [
            997 => now()->subMinutes(10)->timestamp,
            998 => now()->subMinutes(1)->timestamp,
        ]);

        $user = new User();
        $user->id = 999;
        Auth::setUser($user);

        $middleware = new TrackUserActivity();
        $request = Request::create('/', 'GET');

        $middleware->handle($request, function () {
            return response('OK');
        });

        $onlineUsers = Cache::get('users_online', []);
        $this->assertArrayHasKey(998, $onlineUsers);
        $this->assertArrayHasKey(999, $onlineUsers);
        $this->assertArrayNotHasKey(997, $onlineUsers);

        Cache::forget('users_online');
    }
}
