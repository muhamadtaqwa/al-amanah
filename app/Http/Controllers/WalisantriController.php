<?php

namespace App\Http\Controllers;

use App\Models\Walisantri;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class WalisantriController extends Controller
{
    public function index()
    {
        $walisantris = Walisantri::with('user')->get();
        return Inertia::render('Walisantri/Index', ['walisantris' => $walisantris]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'niw' => 'required|unique:walisantris,niw',
            'nama_lengkap' => 'required',
            'no_whatsapp' => 'required',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'username' => $request->niw,
            'password' => Hash::make($request->password),
            'role' => 'walisantri',
        ]);
        $user->assignRole('walisantri');

        Walisantri::create([
            'user_id' => $user->id,
            'niw' => $request->niw,
            'nama_lengkap' => $request->nama_lengkap,
            'no_whatsapp' => $request->no_whatsapp,
        ]);

        return back()->with('success', 'Walisantri berhasil ditambah.');
    }

    public function update(Request $request, $id)
    {
        $walisantri = Walisantri::findOrFail($id);
        $request->validate([
            'nama_lengkap' => 'required',
            'no_whatsapp' => 'required',
        ]);
        $walisantri->update($request->only('nama_lengkap', 'no_whatsapp'));
        return back()->with('success', 'Walisantri berhasil diupdate.');
    }

    public function destroy($id)
    {
        $walisantri = Walisantri::findOrFail($id);
        $walisantri->user->delete();
        $walisantri->delete();
        return back()->with('success', 'Walisantri berhasil dihapus.');
    }
}
