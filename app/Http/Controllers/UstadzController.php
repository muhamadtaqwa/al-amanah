<?php

namespace App\Http\Controllers;

use App\Models\Ustadz;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UstadzController extends Controller
{
    public function index()
    {
        $ustadzs = Ustadz::with('user')->get();
        return Inertia::render('Ustadz/Index', ['ustadzs' => $ustadzs]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'niu' => 'required|unique:ustadzs,niu',
            'nama_lengkap' => 'required',
            'jenis_kelamin' => 'nullable|in:laki-laki,perempuan',
            'pendidikan_terakhir' => 'nullable',
            'status' => 'nullable|in:aktif,tidak aktif',
            'nomor_hp' => 'nullable',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'username' => $request->niu,
            'password' => Hash::make($request->password),
            'role' => 'ustadz',
        ]);
        $user->assignRole('ustadz');

        Ustadz::create([
            'user_id' => $user->id,
            'niu' => $request->niu,
            'nama_lengkap' => $request->nama_lengkap,
            'jenis_kelamin' => $request->jenis_kelamin,
            'pendidikan_terakhir' => $request->pendidikan_terakhir,
            'status' => $request->status ?? 'aktif',
            'nomor_hp' => $request->nomor_hp,
        ]);

        return back()->with('success', 'Ustadz berhasil ditambah.');
    }

    public function update(Request $request, $id)
    {
        $ustadz = Ustadz::findOrFail($id);

        $request->validate([
            'nama_lengkap' => 'required',
            'jenis_kelamin' => 'nullable|in:laki-laki,perempuan',
            'pendidikan_terakhir' => 'nullable',
            'status' => 'nullable|in:aktif,tidak aktif',
            'nomor_hp' => 'nullable',
        ]);

        $ustadz->update($request->only([
            'nama_lengkap',
            'jenis_kelamin',
            'pendidikan_terakhir',
            'status',
            'nomor_hp',
        ]));

        return back()->with('success', 'Ustadz berhasil diupdate.');
    }

    public function destroy($id)
    {
        $ustadz = Ustadz::findOrFail($id);
        $ustadz->user->delete();
        $ustadz->delete();
        return back()->with('success', 'Ustadz berhasil dihapus.');
    }
}
