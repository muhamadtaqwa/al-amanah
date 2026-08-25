<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\PembayaranDetail;
use App\Models\RekeningYayasan;
use App\Models\Santri;
use App\Models\JenisPembayaran;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

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

        $pembayaran = Pembayaran::create($request->all() + ['status_verifikasi' => 'menunggu']);

        // Kirim notifikasi ke santri
        $this->kirimNotifKeSantri(
            $pembayaran->nis,
            '📄 Tagihan Baru',
            $pembayaran->nama_pembayaran . ' - Rp ' . number_format($pembayaran->nominal, 0, ',', '.'),
            '/tagihan'
        );

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

            // Kirim notifikasi lunas
            $this->kirimNotifKeSantri(
                $p->nis,
                '✅ Pembayaran Diterima',
                $p->nama_pembayaran . ' - LUNAS',
                '/tagihan'
            );
        }

        return back()->with('success', 'Cicilan berhasil.');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'jenis' => 'required|exists:jenis_pembayaran,nama',
            'nominal' => 'required|integer',
            'semester' => 'nullable',
            'bulan' => 'nullable',
            'tahun' => 'nullable',
            'nama_pembayaran' => 'nullable',
            'kecualikan' => 'nullable',
        ]);

        $kecualikan = $request->kecualikan
            ? array_map('trim', explode(',', $request->kecualikan))
            : [];

        $santris = Santri::when(!empty($kecualikan), function ($q) use ($kecualikan) {
            $q->whereNotIn('nis', $kecualikan);
        })->get();

        // Format nama pembayaran sesuai jenis
        if ($request->jenis === 'SPP') {
            $namaPembayaran = "SPP - {$request->semester} {$request->tahun}";
        } elseif ($request->jenis === 'Kas') {
            $namaPembayaran = "Kas Bulanan - {$request->bulan} {$request->tahun}";
        } else {
            $namaPembayaran = $request->nama_pembayaran;
        }

        $count = 0;
        foreach ($santris as $s) {
            $pembayaran = Pembayaran::create([
                'nis' => $s->nis,
                'jenis' => $request->jenis,
                'nama_pembayaran' => $namaPembayaran . ' - ' . $s->nama_lengkap,
                'nominal' => $request->nominal,
                'tgl_jatuh_tempo' => $request->tgl_jatuh_tempo,
            ]);

            // Kirim notifikasi
            $this->kirimNotifKeSantri(
                $pembayaran->nis,
                'Tagihan',
                $pembayaran->nama_pembayaran . ' - Rp ' . number_format($pembayaran->nominal, 0, ',', '.'),
                '/tagihan'
            );

            $count++;
        }

        return back()->with('success', $count . ' tagihan berhasil digenerate.');
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

        if ($request->status_verifikasi === 'lunas') {
            $request->validate([
                'nominal_dibayar' => 'required|integer|min:1',
            ]);

            PembayaranDetail::create([
                'pembayaran_id' => $p->id,
                'nominal' => $request->nominal_dibayar,
                'tgl_bayar' => now(),
                'nip' => auth()->user()->username ?? 'admin',
            ]);

            $p->refresh();

            if ($p->sisa <= 0) {
                $p->update([
                    'status_verifikasi' => 'lunas',
                    'tgl_bayar' => now(),
                ]);

                // Kirim notifikasi lunas
                $this->kirimNotifKeSantri(
                    $p->nis,
                    '✅ Pembayaran Diterima',
                    $p->nama_pembayaran . ' - LUNAS',
                    '/tagihan'
                );
            } else {
                $p->update(['status_verifikasi' => 'menunggu']);
            }
        } else {
            $request->validate(['status_verifikasi' => 'required|in:ditolak']);
            $p->update(['status_verifikasi' => 'ditolak']);

            // Kirim notifikasi ditolak
            $this->kirimNotifKeSantri(
                $p->nis,
                '❌ Pembayaran Ditolak',
                $p->nama_pembayaran . ' - pembayaran ditolak',
                '/tagihan'
            );
        }

        return back()->with('success', $request->status_verifikasi === 'lunas' ? 'Pembayaran disetujui.' : 'Pembayaran ditolak.');
    }

    public function tagihan(Request $request)
    {
        $user = $request->user();
        $nis = null;

        if ($user->role === 'santri') {
            $nis = $user->santri->nis;
        }

        $tagihan = Pembayaran::with('santri')
            ->when($nis, function ($q) use ($nis) {
                $q->where('nis', $nis);
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

    private function kirimNotifKeSantri($nis, $title, $body, $url)
    {
        $santri = Santri::where('nis', $nis)->first();
        if (!$santri || !$santri->user_id) return;

        $subscriptions = PushSubscription::where('user_id', $santri->user_id)->get();
        if ($subscriptions->isEmpty()) return;

        $auth = [
            'VAPID' => [
                'subject' => config('webpush.vapid.subject'),
                'publicKey' => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ];

        $webPush = new WebPush($auth);

        foreach ($subscriptions as $sub) {
            $subscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->p256dh,
                'authToken' => $sub->auth,
            ]);

            $webPush->queueNotification(
                $subscription,
                json_encode([
                    'title' => $title,
                    'body' => $body,
                    'icon' => '/icon-amanah.png',
                    'url' => $url,
                ])
            );
        }

        foreach ($webPush->flush() as $report) {
            // Handle report
        }
    }
}
