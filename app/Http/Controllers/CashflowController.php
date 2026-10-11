<?php

namespace App\Http\Controllers;

use App\Models\Cashflow;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashflowController extends Controller
{
    public const NIS_BENDAHARA = ['PA01', 'PA07', 'PI02'];

    private function authorizeInput()
    {
        $user = auth()->user();
        if ($user && $user->role === 'admin') {
            return;
        }

        if ($user && $user->role === 'santri' && in_array($user->santri?->nis, self::NIS_BENDAHARA)) {
            return;
        }

        abort(403, 'Akses input kas terbatas hanya untuk admin dan bendahara santri (PA01, PA07, PI02).');
    }

    public function index(Request $request)
    {
        $kategori = $request->kategori ?? 'kas_putra';
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;

        // Saldo awal (akumulasi sebelum bulan ini)
        $saldoAwal = Cashflow::where('kategori', $kategori)
            ->where(function ($q) use ($bulan, $tahun) {
                $q->whereYear('tanggal', '<', $tahun)
                    ->orWhere(function ($q2) use ($bulan, $tahun) {
                        $q2->whereYear('tanggal', $tahun)
                            ->whereMonth('tanggal', '<', $bulan);
                    });
            })
            ->get()
            ->sum(function ($item) {
                return $item->tipe === 'pemasukan' ? $item->nominal : -$item->nominal;
            });

        // Data bulan berjalan
        $cashflow = Cashflow::where('kategori', $kategori)
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->get();

        // Tambah item "Saldo Bulan Lalu" di riwayat
        if ($saldoAwal != 0) {
            $saldoItem = new Cashflow([
                'id' => 0,
                'kategori' => $kategori,
                'tipe' => $saldoAwal > 0 ? 'pemasukan' : 'pengeluaran',
                'tanggal' => \Carbon\Carbon::createFromDate($tahun, $bulan, 1)->format('Y-m-d'),
                'nominal' => abs($saldoAwal),
                'keterangan' => 'Saldo Bulan Lalu',
            ]);
            $cashflow->push($saldoItem);
        }

        // Urutkan: tanggal terbaru di atas, jika tanggal sama → id terbesar di atas
        $cashflow = $cashflow->sort(function ($a, $b) {
            if ($a->tanggal === $b->tanggal) {
                return $b->id - $a->id;
            }
            return strcmp($b->tanggal, $a->tanggal);
        })->values();

        $pemasukan = $cashflow->where('tipe', 'pemasukan')->sum('nominal');
        $pengeluaran = $cashflow->where('tipe', 'pengeluaran')->sum('nominal');

        // Total = pemasukan - pengeluaran
        $total = $pemasukan - $pengeluaran;

        $user = auth()->user();
        $canInput = $user && (
            $user->role === 'admin' ||
            ($user->role === 'santri' && in_array($user->santri?->nis, self::NIS_BENDAHARA))
        );

        return Inertia::render('Cashflow/Index', [
            'cashflow' => $cashflow,
            'kategori' => $kategori,
            'bulan' => (int) $bulan,
            'tahun' => (int) $tahun,
            'pemasukan' => $pemasukan,
            'pengeluaran' => $pengeluaran,
            'total' => $total,
            'canInput' => (bool) $canInput,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeInput();

        $request->validate([
            'kategori' => 'required|in:kas_putra,kas_putri,anjem,spp,operasional,tahlil,khotmil,mesin_cuci',
            'tipe' => 'required|in:pemasukan,pengeluaran',
            'tanggal' => 'required|date',
            'nominal' => 'required|integer|min:1',
            'keterangan' => 'required|string',
        ]);

        Cashflow::create($request->all());

        return back()->with('success', 'Data cashflow ditambah.');
    }

    public function update(Request $request, $id)
    {
        $this->authorizeInput();

        $request->validate([
            'tanggal' => 'required|date',
            'nominal' => 'required|integer|min:1',
            'keterangan' => 'required|string',
        ]);

        $cashflow = Cashflow::findOrFail($id);
        $cashflow->update($request->only('tanggal', 'nominal', 'keterangan'));

        return back()->with('success', 'Data cashflow diupdate.');
    }

    public function destroy($id)
    {
        $this->authorizeInput();

        Cashflow::findOrFail($id)->delete();

        return back()->with('success', 'Data cashflow dihapus.');
    }

    public function exportPdf(Request $request)
    {
        $kategori = $request->kategori ?? 'kas_putra';
        $bulan = (int) ($request->bulan ?? now()->month);
        $tahun = (int) ($request->tahun ?? now()->year);

        $kategoriLabels = [
            'kas_putra' => 'Kas Santri Putra',
            'kas_putri' => 'Kas Santri Putri',
            'anjem' => 'Kas Antar Jemput (Anjem)',
            'spp' => 'Kas SPP Cash',
            'operasional' => 'Kas Operasional',
            'tahlil' => 'Kas Tahlil',
            'khotmil' => 'Kas Khotmil',
            'mesin_cuci' => 'Kas Mesin Cuci',
        ];
        $kategoriNama = $kategoriLabels[$kategori] ?? ucwords(str_replace('_', ' ', $kategori));

        // Saldo awal (akumulasi sebelum bulan ini)
        $saldoAwal = Cashflow::where('kategori', $kategori)
            ->where(function ($q) use ($bulan, $tahun) {
                $q->whereYear('tanggal', '<', $tahun)
                    ->orWhere(function ($q2) use ($bulan, $tahun) {
                        $q2->whereYear('tanggal', $tahun)
                            ->whereMonth('tanggal', '<', $bulan);
                    });
            })
            ->get()
            ->sum(function ($item) {
                return $item->tipe === 'pemasukan' ? $item->nominal : -$item->nominal;
            });

        // Transaksi bulan berjalan diurutkan secara kronologis (ASC)
        $transactions = Cashflow::where('kategori', $kategori)
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->orderBy('tanggal', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $totalPemasukan = $transactions->where('tipe', 'pemasukan')->sum('nominal');
        $totalPengeluaran = $transactions->where('tipe', 'pengeluaran')->sum('nominal');
        $saldoAkhir = $saldoAwal + $totalPemasukan - $totalPengeluaran;

        $namaBulan = Carbon::createFromDate($tahun, $bulan, 1)->locale('id')->translatedFormat('F Y');

        $startDate = Carbon::createFromDate($tahun, $bulan, 1)->locale('id')->translatedFormat('d M Y');
        $endDate = Carbon::createFromDate($tahun, $bulan, 1)->endOfMonth()->locale('id')->translatedFormat('d M Y');
        $createdDate = Carbon::now()->locale('id')->translatedFormat('d M Y');
        $createdTime = Carbon::now()->format('H:i');

        $iconPath = public_path('icon-amanah.png');
        $iconBase64 = '';
        if (file_exists($iconPath)) {
            $iconBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($iconPath));
        }

        $logoPath = public_path('images/logo-pdf.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
        }

        $data = [
            'kategori' => $kategori,
            'kategoriNama' => $kategoriNama,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'namaBulan' => $namaBulan,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'createdDate' => $createdDate,
            'createdTime' => $createdTime,
            'saldoAwal' => $saldoAwal,
            'transactions' => $transactions,
            'totalPemasukan' => $totalPemasukan,
            'totalPengeluaran' => $totalPengeluaran,
            'saldoAkhir' => $saldoAkhir,
            'tanggalCetak' => Carbon::now()->locale('id')->translatedFormat('d F Y'),
            'logoBase64' => $logoBase64,
            'iconBase64' => $iconBase64,
        ];

        $filename = 'Laporan-Cashflow-' . str_replace('_', '-', $kategori) . '-' . sprintf('%02d', $bulan) . '-' . $tahun . '.pdf';

        $pdf = Pdf::loadView('pdf.cashflow', $data)
            ->setPaper('a4', 'portrait')
            ->setOption('defaultFont', 'poppins');

        return $pdf->download($filename);
    }
}
