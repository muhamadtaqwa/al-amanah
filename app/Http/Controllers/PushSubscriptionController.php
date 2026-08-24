<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushSubscriptionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|string',
            'p256dh' => 'required|string',
            'auth' => 'required|string',
        ]);

        PushSubscription::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'endpoint' => $request->endpoint,
                'p256dh' => $request->p256dh,
                'auth' => $request->auth,
            ]
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request)
    {
        PushSubscription::where('user_id', $request->user()->id)->delete();

        return response()->json(['success' => true]);
    }

    public function kirimTestJenis(Request $request)
    {
        $jenis = $request->jenis;

        $subs = PushSubscription::all();

        if ($subs->isEmpty()) {
            return back()->with('error', 'Tidak ada subscription.');
        }

        $auth = [
            'VAPID' => [
                'subject' => config('webpush.vapid.subject'),
                'publicKey' => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ];

        $webPush = new WebPush($auth);

        $notifMap = [
            'acara' => ['Acara', 'Besok ada acara pondok', '/timeline'],
            'adzan' => ['Adzan', 'Sudah masuk waktu sholat', '/jadwal-sholat'],
            'tenggat' => ['Tenggat', 'Tagihan jatuh tempo H-3 lagi', '/tagihan'],
            'tagihan' => ['Tagihan', 'Tagihan baru dibuat', '/tagihan'],
            'lunas' => ['Lunas', 'Pembayaran diterima', '/tagihan'],
            'ditolak' => ['Ditolak', 'Pembayaran ditolak', '/tagihan'],
        ];

        if (!isset($notifMap[$jenis])) {
            return back()->with('error', 'Jenis notifikasi tidak valid');
        }

        [$title, $body, $url] = $notifMap[$jenis];

        $terkirim = 0;
        $gagal = 0;

        foreach ($subs as $sub) {
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
            if ($report->isSuccess()) {
                $terkirim++;
            } else {
                $gagal++;
            }
        }

        return back()->with('success', "Notifikasi \"$title\" terkirim: $terkirim berhasil, $gagal gagal");
    }
}
