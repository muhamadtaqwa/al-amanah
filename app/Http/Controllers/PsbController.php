<?php

namespace App\Http\Controllers;

use App\Models\Psb;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PsbController extends Controller
{
    public function form()
    {
        return Inertia::render('PSB/Form');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nik' => 'required|unique:psb,nik|unique:santris,nik',
            'nisn' => 'nullable|unique:psb,nisn|unique:santris,nisn',
            'nama_lengkap' => 'required',
            'program_studi' => 'required',
            'nomor_hp' => 'required',
            'tempat_lahir' => 'nullable',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable',
            'alamat' => 'nullable',
            'desa' => 'nullable',
            'kecamatan' => 'nullable',
            'kabupaten' => 'nullable',
            'provinsi' => 'nullable',
            'angkatan' => 'nullable',
            'kamar' => 'nullable',
            'nama_ayah' => 'nullable',
            'nik_ayah' => 'nullable',
            'pekerjaan_ayah' => 'nullable',
            'nama_ibu' => 'nullable',
            'nik_ibu' => 'nullable',
            'pekerjaan_ibu' => 'nullable',
            'no_hp_orang_tua' => 'nullable',
        ]);

        $psb = Psb::create($request->all());

        return redirect()->back()->with([
            'success' => 'Pendaftaran berhasil!',
            'psb_id' => $psb->id,
        ]);
    }

    public function cetak($id)
    {
        $psb = Psb::findOrFail($id);
        return Inertia::render('PSB/Cetak', ['data' => $psb]);
    }

    public function cek()
    {
        return Inertia::render('PSB/Cek');
    }

    public function cekStatus(Request $request)
    {
        $request->validate(['nik' => 'required']);
        $psb = Psb::where('nik', $request->nik)->first();

        if (!$psb) {
            return back()->withErrors(['nik' => 'Data tidak ditemukan.']);
        }

        return Inertia::render('PSB/Cek', ['hasil' => $psb]);
    }

    public function index()
    {
        $pendaftar = Psb::orderBy('created_at', 'desc')->get();
        return Inertia::render('PSB/Verifikasi', ['pendaftar' => $pendaftar]);
    }

    public function verifikasi(Request $request, $id)
    {
        $psb = Psb::findOrFail($id);
        $request->validate(['status' => 'required|in:diterima,ditolak', 'catatan' => 'nullable']);
        $psb->update(['status' => $request->status, 'catatan' => $request->catatan]);

        if ($request->status === 'diterima') {
            // Generate NIS
            $prefix = $psb->jenis_kelamin === 'laki-laki' ? 'PA' : 'PI';
            $last = Santri::where('nis', 'like', $prefix . '%')->orderBy('nis', 'desc')->first();
            if ($last) {
                $num = (int) substr($last->nis, 2) + 1;
            } else {
                $num = 1;
            }
            $nis = $prefix . str_pad($num, 2, '0', STR_PAD_LEFT);

            $user = User::create([
                'username' => $nis,
                'password' => Hash::make($nis),
                'role' => 'santri',
            ]);
            $user->assignRole('santri');

            Santri::create([
                'user_id' => $user->id,
                'nis' => $nis,
                'nisn' => $psb->nisn,
                'nik' => $psb->nik,
                'nama_lengkap' => $psb->nama_lengkap,
                'tempat_lahir' => $psb->tempat_lahir,
                'tanggal_lahir' => $psb->tanggal_lahir,
                'jenis_kelamin' => $psb->jenis_kelamin,
                'alamat' => $psb->alamat,
                'desa' => $psb->desa,
                'kecamatan' => $psb->kecamatan,
                'kabupaten' => $psb->kabupaten,
                'provinsi' => $psb->provinsi,
                'program_studi' => $psb->program_studi,
                'angkatan' => $psb->angkatan,
                'kamar' => $psb->kamar,
                'nomor_hp' => $psb->nomor_hp,
                'status' => 'aktif',
                'nama_ayah' => $psb->nama_ayah,
                'nik_ayah' => $psb->nik_ayah,
                'pekerjaan_ayah' => $psb->pekerjaan_ayah,
                'nama_ibu' => $psb->nama_ibu,
                'nik_ibu' => $psb->nik_ibu,
                'pekerjaan_ibu' => $psb->pekerjaan_ibu,
                'no_hp_orang_tua' => $psb->no_hp_orang_tua,
                'poin_kedisiplinan' => 100,
            ]);
        }

        return back()->with('success', 'Pendaftar berhasil di' . ($request->status === 'diterima' ? 'terima' : 'tolak') . '.');
    }
}
