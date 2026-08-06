<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\PembayaranDetail;
use App\Models\RekeningYayasan;
use App\Models\Santri;
use App\Models\JenisPembayaran;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PembayaranController extends Controller
{
    public function index(Request $request)
    {
        $query = Pembayaran::with(['santri', 'details'])->orderBy('created_at', 'desc');

        if ($request->jenis) $query->where('jenis', $request->jenis);
        if ($request->nis) $query->where('nis', $request->nis);

        $pembayaran = $query->get();

        if ($request->status && $request->status !== 'semua') {
            $pembayaran = $pembayaran->filter(fn($p) => $p->status === $request->status)->values();
        }

        $santris = Santri::all();
        $jenisPembayaran = JenisPembayaran::all();

        return Inertia::render('Pembayaran/Index', [
            'pembayaran' => $pembayaran,
            'santris' => $santris,
            'jenisPembayaran' => $jenisPembayaran,
            'filters' => $request->only('jenis', 'status'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nis' => 'required|exists:santris,nis',
            'jenis' => 'required|exists:jenis_pembayaran,nama',
            'nama_pembayaran' => 'required',
            'nominal' => 'required|integer',
            'tgl_jatuh_tempo' => 'nullable|date',
        ]);

        Pembayaran::create($request->all() + ['status_verifikasi' => 'menunggu']);
        return back()->with('success', 'Tagihan berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $p = Pembayaran::findOrFail($id);
        $p->update($request->only('nama_pembayaran', 'nominal', 'tgl_jatuh_tempo'));
        return back()->with('success', 'Diupdate.');
    }

    public function destroy($id)
    {
        Pembayaran::findOrFail($id)->delete();
        return back()->with('success', 'Dihapus.');
    }

    public function cicilan(Request $request, $id)
    {
        $p = Pembayaran::findOrFail($id);
        $request->validate(['nominal' => 'required|integer|min:1']);

        PembayaranDetail::create([
            'pembayaran_id' => $p->id,
            'nominal' => $request->nominal,
            'tgl_bayar' => now(),
            'nip' => 'admin',
        ]);

        $p->refresh();

        if ($p->sisa <= 0) {
            $p->update(['status_verifikasi' => 'lunas', 'tgl_bayar' => now()]);
        }

        return back()->with('success', 'Cicilan berhasil.');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'jenis' => 'required|exists:jenis_pembayaran,nama',
            'nama_pembayaran' => 'required',
            'nominal' => 'required|integer',
            'bulan' => 'nullable',
            'tahun' => 'nullable',
        ]);

        $santris = Santri::all();
        foreach ($santris as $s) {
            Pembayaran::create([
                'nis' => $s->nis,
                'jenis' => $request->jenis,
                'nama_pembayaran' => $request->nama_pembayaran . ' - ' . ($request->bulan ?? '') . ' ' . ($request->tahun ?? '') . ' - ' . $s->nama_lengkap,
                'nominal' => $request->nominal,
                'tgl_jatuh_tempo' => $request->tgl_jatuh_tempo,
            ]);
        }

        return back()->with('success', 'Tagihan berhasil digenerate.');
    }

    public function uploadBukti(Request $request, $id)
    {
        $p = Pembayaran::findOrFail($id);
        $request->validate(['bukti' => 'required|image|max:2048']);
        $path = $request->file('bukti')->store('bukti', 'public');
        $p->update(['bukti' => $path, 'status_verifikasi' => 'menunggu']);
        return back()->with('success', 'Bukti berhasil diupload. Menunggu verifikasi admin.');
    }

    public function verifikasi(Request $request, $id)
    {
        $p = Pembayaran::findOrFail($id);
        $request->validate(['status_verifikasi' => 'required|in:lunas,ditolak']);
        $p->update(['status_verifikasi' => $request->status_verifikasi]);
        return back()->with('success', $request->status_verifikasi === 'lunas' ? 'Pembayaran disetujui.' : 'Pembayaran ditolak.');
    }

    public function tagihan(Request $request)
    {
        $user = $request->user();
        $nis = null;

        if ($user->role === 'santri') {
            $nis = $user->santri->nis;
        } elseif ($user->role === 'walisantri') {
            $nis = Santri::where('walisantri_id', $user->walisantri->id)->pluck('nis')->toArray();
        }

        $tagihan = Pembayaran::with('santri')
            ->when($nis, function ($q) use ($nis) {
                if (is_array($nis)) {
                    $q->whereIn('nis', $nis);
                } else {
                    $q->where('nis', $nis);
                }
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $rekening = RekeningYayasan::first();

        return Inertia::render('Tagihan/Index', [
            'tagihan' => $tagihan,
            'rekening' => $rekening,
        ]);
    }

    public function storeJenis(Request $request)
    {
        $request->validate(['nama' => 'required|unique:jenis_pembayaran,nama']);
        JenisPembayaran::create($request->all());
        return back()->with('success', 'Kategori ditambah.');
    }

    public function deleteJenis($id)
    {
        JenisPembayaran::findOrFail($id)->delete();
        return back()->with('success', 'Kategori dihapus.');
    }
}
