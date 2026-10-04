<?php

namespace App\Http\Controllers;

use App\Models\Aspirasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AspirasiController extends Controller
{
    private function checkAccess()
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'santri'])) {
            abort(403, 'Akses terbatas untuk santri dan admin.');
        }
    }

    public function index(Request $request)
    {
        $this->checkAccess();

        $user = auth()->user();
        $isAdmin = $user->role === 'admin';

        if ($isAdmin) {
            $query = Aspirasi::with('santri')->orderBy('created_at', 'desc');

            if ($request->status && $request->status !== 'semua') {
                $query->where('status', $request->status);
            }

            if ($request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('pesan', 'like', "%{$search}%")
                        ->orWhere('nama_pengirim', 'like', "%{$search}%");
                });
            }

            $aspirasiList = $query->paginate(15)->withQueryString();

            $stats = [
                'total' => Aspirasi::count(),
                'diterima' => Aspirasi::where('status', 'diterima')->count(),
                'diproses' => Aspirasi::where('status', 'diproses')->count(),
                'selesai' => Aspirasi::where('status', 'selesai')->count(),
            ];

            return Inertia::render('Aspirasi/Index', [
                'isAdmin' => true,
                'aspirasiList' => $aspirasiList,
                'stats' => $stats,
                'filters' => $request->only('status', 'search'),
            ]);
        } else {
            $santri = $user->santri;
            $santriId = $santri ? $santri->id : 0;

            // Riwayat aspirasi yang dikirim oleh santri ini
            $riwayat = Aspirasi::where('santri_id', $santriId)
                ->orderBy('created_at', 'desc')
                ->get();

            return Inertia::render('Aspirasi/Index', [
                'isAdmin' => false,
                'santri' => $santri,
                'riwayat' => $riwayat,
            ]);
        }
    }

    public function store(Request $request)
    {
        $this->checkAccess();

        $user = auth()->user();

        $request->validate([
            'pesan' => 'required|string|min:3',
            'is_anonim' => 'nullable|boolean',
        ]);

        $santri = $user->santri;
        $isAnonim = (bool) $request->is_anonim;
        $namaPengirim = $isAnonim ? 'Anonim' : ($santri->nama_lengkap ?? $user->username);

        Aspirasi::create([
            'santri_id' => $santri ? $santri->id : null,
            'nama_pengirim' => $namaPengirim,
            'is_anonim' => $isAnonim,
            'pesan' => $request->pesan,
            'status' => 'diterima',
        ]);

        return back()->with('success', 'Aspirasi Anda berhasil dikirim dan langsung diterima pengurus.');
    }

    public function tanggapi(Request $request, $id)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:diterima,diproses,selesai',
            'tanggapan' => 'nullable|string',
        ]);

        $aspirasi = Aspirasi::findOrFail($id);
        $aspirasi->update([
            'status' => $request->status,
            'tanggapan' => $request->tanggapan,
            'tgl_tanggapan' => now(),
        ]);

        return back()->with('success', 'Tanggapan & status berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $this->checkAccess();

        $user = auth()->user();
        $aspirasi = Aspirasi::findOrFail($id);

        if ($user->role !== 'admin' && $aspirasi->santri_id !== $user->santri?->id) {
            abort(403);
        }

        $aspirasi->delete();

        return back()->with('success', 'Aspirasi berhasil dihapus.');
    }
}
