<?php

namespace App\Http\Controllers;

use App\Models\Santri;
use App\Models\User;
use App\Models\Walisantri;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SantriController extends Controller
{
    public function index()
    {
        $santris = Santri::with(['user', 'walisantri'])->get();
        $walisantris = Walisantri::all();
        return Inertia::render('Santri/Index', [
            'santris' => $santris,
            'walisantris' => $walisantris,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nis' => 'required|unique:santris,nis',
            'nik' => 'nullable',
            'nama_lengkap' => 'required',
            'tempat_lahir' => 'nullable',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:laki-laki,perempuan',
            'program_studi' => 'nullable',
            'angkatan' => 'nullable',
            'kamar' => 'nullable',
            'nomor_hp' => 'nullable',
            'status' => 'nullable|in:aktif,lulus,keluar',
            'password' => 'required|min:6',
            'walisantri_id' => 'required|exists:walisantris,id',
        ]);

        $user = User::create([
            'username' => $request->nis,
            'password' => Hash::make($request->password),
            'role' => 'santri',
        ]);
        $user->assignRole('santri');

        Santri::create([
            'user_id' => $user->id,
            'walisantri_id' => $request->walisantri_id,
            'nis' => $request->nis,
            'nik' => $request->nik,
            'nama_lengkap' => $request->nama_lengkap,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'jenis_kelamin' => $request->jenis_kelamin,
            'program_studi' => $request->program_studi,
            'angkatan' => $request->angkatan,
            'kamar' => $request->kamar,
            'nomor_hp' => $request->nomor_hp,
            'status' => $request->status ?? 'aktif',
            'poin_kedisiplinan' => 100,
        ]);

        return back()->with('success', 'Santri berhasil ditambah.');
    }

    public function update(Request $request, $id)
    {
        $santri = Santri::findOrFail($id);

        $request->validate([
            'nik' => 'nullable',
            'nama_lengkap' => 'required',
            'tempat_lahir' => 'nullable',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:laki-laki,perempuan',
            'program_studi' => 'nullable',
            'angkatan' => 'nullable',
            'kamar' => 'nullable',
            'nomor_hp' => 'nullable',
            'status' => 'nullable|in:aktif,lulus,keluar',
            'walisantri_id' => 'required|exists:walisantris,id',
        ]);

        $santri->update($request->only([
            'nik',
            'nama_lengkap',
            'tempat_lahir',
            'tanggal_lahir',
            'jenis_kelamin',
            'program_studi',
            'angkatan',
            'kamar',
            'nomor_hp',
            'status',
            'walisantri_id',
            'poin_kedisiplinan',
        ]));

        return back()->with('success', 'Santri berhasil diupdate.');
    }

    public function destroy($id)
    {
        $santri = Santri::findOrFail($id);
        $santri->user->delete();
        $santri->delete();
        return back()->with('success', 'Santri berhasil dihapus.');
    }
}
