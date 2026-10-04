<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Cashflow - {{ $kategoriNama }} - {{ $namaBulan }}</title>
    <style>
        @page {
            margin: 1.5cm 1.5cm 2cm 1.5cm;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat */
        .kop-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }

        .kop-table td {
            vertical-align: middle;
            padding: 0;
        }

        .kop-logo {
            width: 75px;
            text-align: left;
        }

        .kop-logo img {
            max-height: 65px;
            width: auto;
        }

        .kop-text {
            text-align: center;
            padding-right: 75px; /* Kompensasi agar teks benar-benar di tengah */
        }

        .kop-title-sub {
            font-size: 11px;
            font-weight: 600;
            color: #475569;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 0 0 2px 0;
        }

        .kop-title-main {
            font-size: 18px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin: 0;
        }

        .kop-subtitle {
            font-size: 9px;
            color: #64748b;
            margin-top: 3px;
        }

        .kop-line-double {
            border-top: 2px solid #0f172a;
            border-bottom: 1px solid #0f172a;
            height: 3px;
            margin-top: 8px;
            margin-bottom: 15px;
        }

        /* Judul Laporan */
        .report-header {
            text-align: center;
            margin-bottom: 15px;
        }

        .report-title {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .report-meta {
            font-size: 10px;
            color: #475569;
        }

        /* Summary Box */
        .summary-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin-bottom: 15px;
        }

        .summary-card {
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 8px 10px;
            text-align: left;
        }

        .summary-label {
            font-size: 8.5px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 3px;
        }

        .summary-val {
            font-size: 11.5px;
            font-weight: bold;
            font-family: 'Courier New', Courier, monospace;
        }

        .val-primary { color: #0369a1; }
        .val-green { color: #15803d; }
        .val-red { color: #b91c1c; }

        /* Tabel Transaksi */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .data-table th, 
        .data-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 7px;
            font-size: 9.5px;
        }

        .data-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            font-size: 8.5px;
            letter-spacing: 0.3px;
        }

        .data-table tr:nth-child(even) td {
            background-color: #fcfdfe;
        }

        .data-table .row-saldo-awal td {
            background-color: #f8fafc;
            font-style: italic;
            font-weight: 600;
        }

        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-mono { font-family: 'Courier New', Courier, monospace; }
        .font-bold { font-weight: bold; }

        .data-table tfoot td {
            background-color: #f1f5f9;
            font-weight: bold;
            border-top: 2px solid #94a3b8;
        }

        /* Tanda Tangan */
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
            page-break-inside: avoid;
        }

        .signature-table td {
            width: 50%;
            vertical-align: top;
            padding: 0 20px;
            text-align: center;
        }

        .sig-date {
            font-size: 10px;
            margin-bottom: 4px;
        }

        .sig-title {
            font-size: 10px;
            font-weight: bold;
            color: #334155;
            margin-bottom: 60px;
        }

        .sig-name {
            font-size: 10.5px;
            font-weight: bold;
            text-decoration: underline;
            color: #0f172a;
        }

        .sig-role {
            font-size: 9px;
            color: #64748b;
            margin-top: 2px;
        }

        /* Footer Cetak */
        .footer-note {
            position: fixed;
            bottom: -1.2cm;
            left: 0;
            right: 0;
            font-size: 8px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 4px;
            text-align: right;
        }
    </style>
</head>
<body>

    <!-- KOP SURAT -->
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                @if(!empty($logoBase64))
                    <img src="{{ $logoBase64 }}" alt="Logo">
                @endif
            </td>
            <td class="kop-text">
                <div class="kop-title-sub">Laporan Pembukuan Kas</div>
                <div class="kop-title-main">Pondok Pesantren Al-Amanah</div>
                <div class="kop-subtitle">Sistem Informasi Manajemen Keuangan &bull; Cetak Mandiri</div>
            </td>
        </tr>
    </table>
    <div class="kop-line-double"></div>

    <!-- JUDUL LAPORAN -->
    <div class="report-header">
        <div class="report-title">BUKU KAS &amp; MUTASI KEUANGAN</div>
        <div class="report-meta">
            <strong>Kategori:</strong> {{ $kategoriNama }} &nbsp;|&nbsp; 
            <strong>Periode:</strong> {{ $namaBulan }} &nbsp;|&nbsp; 
            <strong>Dicetak:</strong> {{ $tanggalCetak }}
        </div>
    </div>

    <!-- RINGKASAN SALDO -->
    <table class="summary-table">
        <tr>
            <td class="summary-card" style="width: 25%;">
                <div class="summary-label">Saldo Bulan Lalu</div>
                <div class="summary-val val-primary">Rp {{ number_format($saldoAwal, 0, ',', '.') }}</div>
            </td>
            <td class="summary-card" style="width: 25%;">
                <div class="summary-label">Total Pemasukan</div>
                <div class="summary-val val-green">Rp {{ number_format($totalPemasukan, 0, ',', '.') }}</div>
            </td>
            <td class="summary-card" style="width: 25%;">
                <div class="summary-label">Total Pengeluaran</div>
                <div class="summary-val val-red">Rp {{ number_format($totalPengeluaran, 0, ',', '.') }}</div>
            </td>
            <td class="summary-card" style="width: 25%;">
                <div class="summary-label">Saldo Akhir</div>
                <div class="summary-val {{ $saldoAkhir >= 0 ? 'val-primary' : 'val-red' }}">
                    Rp {{ number_format($saldoAkhir, 0, ',', '.') }}
                </div>
            </td>
        </tr>
    </table>

    <!-- TABEL TRANSAKSI -->
    @php
        $runningBalance = $saldoAwal;
        $no = 1;
    @endphp

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 12%;">Tanggal</th>
                <th style="width: 38%;">Uraian / Keterangan</th>
                <th style="width: 15%;">Pemasukan (Rp)</th>
                <th style="width: 15%;">Pengeluaran (Rp)</th>
                <th style="width: 15%;">Saldo (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <!-- Baris Saldo Awal -->
            <tr class="row-saldo-awal">
                <td class="text-center">-</td>
                <td class="text-center">01/{{ sprintf('%02d', $bulan) }}/{{ $tahun }}</td>
                <td>Saldo Awal (Akumulasi Bulan Lalu)</td>
                <td class="text-right font-mono">{{ $saldoAwal > 0 ? number_format($saldoAwal, 0, ',', '.') : '-' }}</td>
                <td class="text-right font-mono">{{ $saldoAwal < 0 ? number_format(abs($saldoAwal), 0, ',', '.') : '-' }}</td>
                <td class="text-right font-mono font-bold">{{ number_format($runningBalance, 0, ',', '.') }}</td>
            </tr>

            @forelse($transactions as $t)
                @php
                    if ($t->tipe === 'pemasukan') {
                        $runningBalance += $t->nominal;
                    } else {
                        $runningBalance -= $t->nominal;
                    }
                @endphp
                <tr>
                    <td class="text-center">{{ $no++ }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($t->tanggal)->format('d/m/Y') }}</td>
                    <td>{{ $t->keterangan }}</td>
                    <td class="text-right font-mono">
                        {{ $t->tipe === 'pemasukan' ? number_format($t->nominal, 0, ',', '.') : '-' }}
                    </td>
                    <td class="text-right font-mono">
                        {{ $t->tipe === 'pengeluaran' ? number_format($t->nominal, 0, ',', '.') : '-' }}
                    </td>
                    <td class="text-right font-mono font-bold">
                        {{ number_format($runningBalance, 0, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center" style="padding: 18px; color: #94a3b8;">
                        Tidak ada riwayat transaksi pada bulan ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3" class="text-right font-bold">TOTAL TRANSAKSI BULAN INI</td>
                <td class="text-right font-mono font-bold">{{ number_format($totalPemasukan, 0, ',', '.') }}</td>
                <td class="text-right font-mono font-bold">{{ number_format($totalPengeluaran, 0, ',', '.') }}</td>
                <td class="text-center font-mono" style="color: #94a3b8;">-</td>
            </tr>
            <tr>
                <td colspan="5" class="text-right font-bold" style="background-color: #e2e8f0; letter-spacing: 0.5px;">SALDO AKHIR KAS PER {{ strtoupper($namaBulan) }}</td>
                <td class="text-right font-mono font-bold" style="background-color: #e2e8f0; color: #0369a1; font-size: 10px;">{{ number_format($saldoAkhir, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <!-- TANDA TANGAN -->
    <table class="signature-table">
        <tr>
            <td>
                <div class="sig-date">&nbsp;</div>
                <div class="sig-title">Mengetahui,<br>Pengasuh / Pimpinan Pondok</div>
                <div class="sig-name">( ............................................ )</div>
                <div class="sig-role">Pondok Pesantren Al-Amanah</div>
            </td>
            <td>
                <div class="sig-date">Cetak: {{ $tanggalCetak }}</div>
                <div class="sig-title">Bendahara Keuangan<br>{{ $kategoriNama }}</div>
                <div class="sig-name">( ............................................ )</div>
                <div class="sig-role">Pondok Pesantren Al-Amanah</div>
            </td>
        </tr>
    </table>

    <!-- FOOTER NOTE -->
    <div class="footer-note">
        Dokumen resmi dicetak otomatis via SIM Pesantren Al-Amanah &bull; Halaman dicetak pada {{ now()->format('d/m/Y H:i') }} WIB
    </div>

</body>
</html>
