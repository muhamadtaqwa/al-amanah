<?php

namespace App\Http\Controllers;

use App\Models\Cashflow;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashflowController extends Controller
{
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

        return Inertia::render('Cashflow/Index', [
            'cashflow' => $cashflow,
            'kategori' => $kategori,
            'bulan' => (int) $bulan,
            'tahun' => (int) $tahun,
            'pemasukan' => $pemasukan,
            'pengeluaran' => $pengeluaran,
            'total' => $total,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kategori' => 'required|in:kas_putra,kas_putri,spp,operasional,tahlil,anjem',
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
            'spp' => 'Kas SPP',
            'operasional' => 'Kas Operasional',
            'tahlil' => 'Kas Tahlil',
            'anjem' => 'Kas Antar Jemput (Anjem)',
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

        $logoPath = public_path('images/logo-pdf.png');
        if (!file_exists($logoPath)) {
            $logoPath = public_path('images/icon-amanah.png');
        }
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
        }

        $namaBulan = Carbon::createFromDate($tahun, $bulan, 1)->locale('id')->translatedFormat('F Y');

        $data = [
            'kategori' => $kategori,
            'kategoriNama' => $kategoriNama,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'namaBulan' => $namaBulan,
            'saldoAwal' => $saldoAwal,
            'transactions' => $transactions,
            'totalPemasukan' => $totalPemasukan,
            'totalPengeluaran' => $totalPengeluaran,
            'saldoAkhir' => $saldoAkhir,
            'logoBase64' => $logoBase64,
            'tanggalCetak' => Carbon::now()->locale('id')->translatedFormat('d F Y'),
        ];

        $filename = 'Laporan-Cashflow-' . str_replace('_', '-', $kategori) . '-' . sprintf('%02d', $bulan) . '-' . $tahun . '.pdf';

        $pdf = Pdf::loadView('pdf.cashflow', $data)->setPaper('a4', 'portrait');

        return $pdf->download($filename);
    }
}
