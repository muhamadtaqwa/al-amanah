<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit()
    {
        $user = auth()->user()->load('ustadz', 'santri', 'walisantri');
        return Inertia::render('Profil/Index', ['user' => $user]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'nama_lengkap' => 'required',
            'password' => 'nullable|min:6',
        ]);

        // Update nama di tabel profil sesuai role
        if ($user->role === 'ustadz') {
            $user->ustadz->update(['nama_lengkap' => $request->nama_lengkap]);
        } elseif ($user->role === 'santri') {
            $user->santri->update(['nama_lengkap' => $request->nama_lengkap]);
        } elseif ($user->role === 'walisantri') {
            $user->walisantri->update(['nama_lengkap' => $request->nama_lengkap]);
        }

        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        return back()->with('success', 'Profil berhasil diupdate.');
    }

    // Admin ganti password user lain
    public function gantiPassword(Request $request)
    {
        $request->validate([
            'username' => 'required|exists:users,username',
            'password_baru' => 'required|min:6',
        ]);

        $user = User::where('username', $request->username)->first();
        $user->update(['password' => Hash::make($request->password_baru)]);

        return back()->with('success', 'Password berhasil diubah.');
    }
}
