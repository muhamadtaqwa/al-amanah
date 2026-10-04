<?php

namespace App\Http\Controllers;

use App\Models\HaidRecord;
use App\Models\Santri;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HaidController extends Controller
{
    private function checkAccess()
    {
        $user = auth()->user();
        if ($user->role === 'admin') {
            return true;
        }
        if ($user->role === 'santri' && $user->santri && str_starts_with($user->santri->nis, 'PI')) {
            return true;
        }
        abort(403, 'Akses terbatas hanya untuk santri putri dan admin.');
    }

    public function index(Request $request)
    {
        $this->checkAccess();

        $user = auth()->user();
        $isAdmin = $user->role === 'admin';

        if ($isAdmin) {
            // Rekap santri haid aktif saat ini (tgl_selesai IS NULL)
            $haidAktif = HaidRecord::with('santri')
                ->whereNull('tgl_selesai')
                ->orderBy('tgl_mulai', 'asc')
                ->get()
                ->map(function ($item) {
                    $hariKe = Carbon::parse($item->tgl_mulai)->diffInDays(now()) + 1;
                    $item->hari_ke = $hariKe;
                    $item->is_istihadhah = $hariKe > 15;
                    return $item;
                });

            // Riwayat semua catatan haid santri putri
            $query = HaidRecord::with('santri')->orderBy('tgl_mulai', 'desc');

            if ($request->search) {
                $search = $request->search;
                $query->whereHas('santri', function ($q) use ($search) {
                    $q->where('nama_lengkap', 'like', "%{$search}%")
                        ->orWhere('nis', 'like', "%{$search}%");
                });
            }

            $riwayat = $query->paginate(15)->withQueryString();

            // Daftar santri putri untuk pilihan input manual admin
            $santriPutriList = Santri::where('nis', 'like', 'PI%')
                ->orderBy('nama_lengkap', 'asc')
                ->get(['id', 'nis', 'nama_lengkap', 'kamar']);

            return Inertia::render('Haid/Index', [
                'isAdmin' => true,
                'haidAktif' => $haidAktif,
                'riwayat' => $riwayat,
                'santriPutriList' => $santriPutriList,
                'filters' => $request->only('search'),
            ]);
        } else {
            // Khusus santri putri
            $santri = $user->santri;

            // Catatan haid yang sedang berjalan saat ini
            $activeRecord = HaidRecord::where('santri_id', $santri->id)
                ->whereNull('tgl_selesai')
                ->latest('tgl_mulai')
                ->first();

            $activeHariKe = null;
            $isIstihadhah = false;
            if ($activeRecord) {
                $activeHariKe = Carbon::parse($activeRecord->tgl_mulai)->diffInDays(now()) + 1;
                $isIstihadhah = $activeHariKe > 15;
            }

            // Catatan terakhir yang sudah selesai untuk menghitung masa suci
            $lastCompleted = HaidRecord::where('santri_id', $santri->id)
                ->whereNotNull('tgl_selesai')
                ->latest('tgl_selesai')
                ->first();

            $masaSuciHari = null;
            if (!$activeRecord && $lastCompleted) {
                $masaSuciHari = Carbon::parse($lastCompleted->tgl_selesai)->diffInDays(now());
            }

            // Semua riwayat santri ini
            $riwayat = HaidRecord::where('santri_id', $santri->id)
                ->orderBy('tgl_mulai', 'desc')
                ->get();

            return Inertia::render('Haid/Index', [
                'isAdmin' => false,
                'santri' => $santri,
                'activeRecord' => $activeRecord,
                'activeHariKe' => $activeHariKe,
                'isIstihadhah' => $isIstihadhah,
                'masaSuciHari' => $masaSuciHari,
                'riwayat' => $riwayat,
            ]);
        }
    }

    public function mulai(Request $request)
    {
        $this->checkAccess();

        $user = auth()->user();
        $isAdmin = $user->role === 'admin';

        $rules = [
            'tgl_mulai' => 'required|date',
            'warna_darah' => 'nullable|string',
            'catatan' => 'nullable|string',
        ];

        if ($isAdmin) {
            $rules['santri_id'] = 'required|exists:santris,id';
        }

        $request->validate($rules);

        $santriId = $isAdmin ? $request->santri_id : $user->santri->id;

        // Cek apakah masih ada siklus yang belum selesai
        $existing = HaidRecord::where('santri_id', $santriId)
            ->whereNull('tgl_selesai')
            ->first();

        if ($existing) {
            return back()->withErrors(['tgl_mulai' => 'Masih ada siklus haid yang sedang aktif belum ditutup.']);
        }

        HaidRecord::create([
            'santri_id' => $santriId,
            'tgl_mulai' => $request->tgl_mulai,
            'warna_darah' => $request->warna_darah,
            'catatan' => $request->catatan,
            'status' => 'haid',
            'created_by' => $user->id,
        ]);

        return back()->with('success', 'Catatan mulai haid berhasil disimpan.');
    }

    public function selesai(Request $request, $id)
    {
        $this->checkAccess();

        $user = auth()->user();
        $record = HaidRecord::findOrFail($id);

        // Jika santri, hanya boleh menyelesaikan miliknya sendiri
        if ($user->role === 'santri' && $record->santri_id !== $user->santri->id) {
            abort(403);
        }

        $request->validate([
            'tgl_selesai' => 'required|date|after_or_equal:' . $record->tgl_mulai,
        ]);

        $tglMulai = Carbon::parse($record->tgl_mulai);
        $tglSelesai = Carbon::parse($request->tgl_selesai);
        $diffHours = max(1, $tglMulai->diffInHours($tglSelesai));
        $durasiHari = round($diffHours / 24, 1);

        // Hukum fiqih: Jika > 15 hari, maka statusnya istihadhah
        $status = $durasiHari > 15 ? 'istihadhah' : 'suci';

        $record->update([
            'tgl_selesai' => $request->tgl_selesai,
            'durasi_hari' => $durasiHari,
            'status' => $status,
        ]);

        return back()->with('success', 'Siklus haid selesai dicatat. Alhamdulillah.');
    }

    public function store(Request $request)
    {
        $this->checkAccess();

        $user = auth()->user();
        $isAdmin = $user->role === 'admin';

        $rules = [
            'tgl_mulai' => 'required|date',
            'tgl_selesai' => 'required|date|after_or_equal:tgl_mulai',
            'warna_darah' => 'nullable|string',
            'catatan' => 'nullable|string',
        ];

        if ($isAdmin) {
            $rules['santri_id'] = 'required|exists:santris,id';
        }

        $request->validate($rules);

        $santriId = $isAdmin ? $request->santri_id : $user->santri->id;

        $tglMulai = Carbon::parse($request->tgl_mulai);
        $tglSelesai = Carbon::parse($request->tgl_selesai);
        $diffHours = max(1, $tglMulai->diffInHours($tglSelesai));
        $durasiHari = round($diffHours / 24, 1);
        $status = $durasiHari > 15 ? 'istihadhah' : 'suci';

        HaidRecord::create([
            'santri_id' => $santriId,
            'tgl_mulai' => $request->tgl_mulai,
            'tgl_selesai' => $request->tgl_selesai,
            'durasi_hari' => $durasiHari,
            'warna_darah' => $request->warna_darah,
            'catatan' => $request->catatan,
            'status' => $status,
            'created_by' => $user->id,
        ]);

        return back()->with('success', 'Riwayat haid berhasil ditambahkan.');
    }

    public function destroy($id)
    {
        $this->checkAccess();

        $user = auth()->user();
        $record = HaidRecord::findOrFail($id);

        if ($user->role === 'santri' && $record->santri_id !== $user->santri->id) {
            abort(403);
        }

        $record->delete();

        return back()->with('success', 'Catatan berhasil dihapus.');
    }
}
