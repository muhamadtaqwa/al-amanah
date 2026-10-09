<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan Kas - {{ $kategoriNama }} - {{ $namaBulan }}</title>
    <style>
        @page {
            size: a4 portrait;
            margin: 1.2cm 1.2cm 1.4cm 1.2cm;
        }

        @font-face {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: normal;
            src: url('{{ str_replace('\\', '/', public_path('fonts/poppins/Poppins-Regular.ttf')) }}') format('truetype');
        }

        @font-face {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: 500;
            src: url('{{ str_replace('\\', '/', public_path('fonts/poppins/Poppins-Medium.ttf')) }}') format('truetype');
        }

        @font-face {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: 600;
            src: url('{{ str_replace('\\', '/', public_path('fonts/poppins/Poppins-SemiBold.ttf')) }}') format('truetype');
        }

        @font-face {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: bold;
            src: url('{{ str_replace('\\', '/', public_path('fonts/poppins/Poppins-Bold.ttf')) }}') format('truetype');
        }

        * {
            box-sizing: border-box;
            font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
        }

        body {
            font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
            font-size: 8.5px;
            color: #111827;
            line-height: 1.35;
            margin: 0;
            padding: 0;
        }

        /* ============================================================
           HEADER ATAS (Judul Kas & Brand)
        ============================================================ */
        .top-bar {
            width: 100%;
            border-collapse: collapse;
        }

        .top-bar td {
            vertical-align: middle;
            padding: 0;
        }

        .top-title {
            font-size: 17px;
            font-weight: bold;
            color: #111827;
            margin: 0;
            line-height: 1.2;
        }

        .top-brand {
            text-align: right;
            white-space: nowrap;
        }

        .brand-icon {
            height: 22px;
            width: auto;
            vertical-align: middle;
            margin-right: 4px;
        }

        .brand-name {
            font-size: 15px;
            font-weight: bold;
            color: #111827;
            vertical-align: middle;
            letter-spacing: -0.2px;
        }

        .divider-line {
            border: 0;
            border-top: 1px solid #d1d5db;
            margin: 10px 0 10px 0;
        }

        /* ============================================================
           SECTION METADATA (Laporan Kas, Periode, Saldo Akhir)
        ============================================================ */
        .meta-section {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-section td {
            vertical-align: top;
            padding: 0;
        }

        .meta-left {
            width: 50%;
        }

        .meta-right {
            width: 50%;
            text-align: right;
        }

        .report-heading {
            font-size: 11px;
            font-weight: bold;
            color: #111827;
            margin: 0 0 5px 0;
        }

        .meta-table {
            border-collapse: collapse;
        }

        .meta-table td {
            font-size: 8.5px;
            padding: 1px 0;
            vertical-align: middle;
        }

        .meta-lbl {
            color: #4b5563;
            width: 52px;
        }

        .meta-val {
            font-weight: 600;
            color: #111827;
        }

        .meta-table-right {
            border-collapse: collapse;
            margin-left: auto;
        }

        .meta-table-right td {
            font-size: 8.5px;
            padding: 1px 0;
            vertical-align: middle;
        }

        .meta-lbl-r {
            color: #4b5563;
            text-align: right;
            padding-right: 14px;
        }

        .meta-val-r {
            text-align: right;
            color: #111827;
            font-weight: 500;
        }

        .meta-val-r.val-bold {
            font-weight: bold;
        }

        /* ============================================================
           SUB-BAR (Total Transaksi & Waktu Dibuat)
        ============================================================ */
        .sub-bar {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        .sub-bar td {
            font-size: 8px;
            color: #374151;
            padding: 0;
            vertical-align: middle;
        }

        .sub-bar-right {
            text-align: right;
        }

        /* ============================================================
           TABEL TRANSAKSI MUTASI (Persis myBisnis)
        ============================================================ */
        .report-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e5e7eb;
            margin-bottom: 20px;
        }

        .report-table thead th {
            background-color: #f9fafb;
            color: #111827;
            font-size: 8.5px;
            font-weight: bold;
            text-align: left;
            padding: 7px 6px;
            border: 0;
            border-bottom: 1px solid #e5e7eb;
            border-top: 1px solid #e5e7eb;
        }

        .report-table tbody td {
            padding: 6px 6px;
            font-size: 8px;
            color: #111827;
            border: 0;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: middle;
            text-align: left;
        }

        /* Lebar Kolom */
        .col-date {
            width: 15%;
        }

        .col-desc {
            width: 37%;
        }

        .col-in {
            width: 16%;
        }

        .col-out {
            width: 16%;
        }

        .col-bal {
            width: 16%;
        }

        /* ============================================================
           PENGESAHAN TANDA TANGAN (Opsional Formal)
        ============================================================ */
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
            margin-top: 15px;
        }

        .signature-table td {
            width: 50%;
            vertical-align: top;
            text-align: center;
            padding: 0 15px;
        }

        .sig-date {
            font-size: 8px;
            color: #4b5563;
            margin-bottom: 4px;
        }

        .sig-title {
            font-size: 8.5px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 46px;
            line-height: 1.35;
        }

        .sig-name {
            font-size: 9px;
            font-weight: bold;
            text-decoration: underline;
            color: #111827;
        }

        .sig-role {
            font-size: 7.5px;
            color: #6b7280;
            margin-top: 2px;
        }
    </style>
</head>

<body>

    <!-- 1. TOP BAR: Judul Kas & Brand -->
    <table class="top-bar">
        <tr>
            <td>
                <div class="top-title">{{ $kategoriNama }}</div>
            </td>
            <td class="top-brand">

                <span class="brand-name">Al-Amanah</span>
            </td>
        </tr>
    </table>

    <hr class="divider-line">

    <!-- 2. METADATA SECTION: Laporan Kas, Periode & Saldo Akhir -->
    <table class="meta-section">
        <tr>
            <td class="meta-left">
                <div class="report-heading">Laporan Kas</div>
                <table class="meta-table">
                    <tr>
                        <td class="meta-lbl">Dari</td>
                        <td class="meta-val">{{ $startDate }}</td>
                    </tr>
                    <tr>
                        <td class="meta-lbl">Sampai</td>
                        <td class="meta-val">{{ $endDate }}</td>
                    </tr>
                </table>
            </td>
            <td class="meta-right">
                <table class="meta-table-right">
                    <tr>
                        <td class="meta-val-r">Semua Transaksi</td>
                    </tr>
                    <tr>
                        <td class="meta-lbl-r">Saldo Akhir</td>
                        <td class="meta-val-r val-bold">
                            {{ ($saldoAkhir < 0 ? '- ' : '') . 'Rp ' . number_format(abs($saldoAkhir), 0, ',', '.') }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <hr class="divider-line">

    <!-- 3. SUB-BAR: Total Transaksi & Waktu Dibuat -->
    <table class="sub-bar">
        <tr>
            <td>
                Total Transaksi : {{ count($transactions) }}
            </td>
            <td class="sub-bar-right">
                Laporan Dibuat {{ $createdDate }} &bull; {{ $createdTime }}
            </td>
        </tr>
    </table>

    <!-- 4. TABEL TRANSAKSI MUTASI -->
    @php
        $runningBalance = $saldoAwal;
    @endphp

    <table class="report-table">
        <thead>
            <tr>
                <th class="col-date">Tanggal</th>
                <th class="col-desc">Keterangan</th>
                <th class="col-in">Uang Masuk</th>
                <th class="col-out">Uang Keluar</th>
                <th class="col-bal">Saldo</th>
            </tr>
        </thead>
        <tbody>
            <!-- Baris Saldo Awal -->
            <tr>
                <td class="col-date">{{ $startDate }}</td>
                <td class="col-desc">Saldo Awal</td>
                <td class="col-in">
                    {{ $saldoAwal > 0 ? 'Rp ' . number_format($saldoAwal, 0, ',', '.') : '--' }}
                </td>
                <td class="col-out">
                    {{ $saldoAwal < 0 ? 'Rp ' . number_format(abs($saldoAwal), 0, ',', '.') : '--' }}
                </td>
                <td class="col-bal">
                    {{ ($saldoAwal < 0 ? '- ' : '') . 'Rp ' . number_format(abs($saldoAwal), 0, ',', '.') }}
                </td>
            </tr>

            <!-- Baris Transaksi -->
            @forelse($transactions as $t)
                @php
                    if ($t->tipe === 'pemasukan') {
                        $runningBalance += $t->nominal;
                    } else {
                        $runningBalance -= $t->nominal;
                    }
                    $keterangan = !empty(trim($t->keterangan)) ? $t->keterangan : '--';
                @endphp
                <tr>
                    <td class="col-date">
                        {{ \Carbon\Carbon::parse($t->tanggal)->locale('id')->translatedFormat('d M Y') }}</td>
                    <td class="col-desc">{{ $keterangan }}</td>
                    <td class="col-in">
                        {{ $t->tipe === 'pemasukan' ? 'Rp ' . number_format($t->nominal, 0, ',', '.') : '--' }}
                    </td>
                    <td class="col-out">
                        {{ $t->tipe === 'pengeluaran' ? 'Rp ' . number_format($t->nominal, 0, ',', '.') : '--' }}
                    </td>
                    <td class="col-bal">
                        {{ ($runningBalance < 0 ? '- ' : '') . 'Rp ' . number_format(abs($runningBalance), 0, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; padding: 18px; color: #9ca3af; font-style: italic;">
                        Tidak ada transaksi pada periode ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- 5. PENGESAHAN TANDA TANGAN (Formal Lembaga) -->
    <table class="signature-table">
        <tr>
            <td>
                <div class="sig-date">&nbsp;</div>
                <div class="sig-title">Mengetahui,<br>Pengasuh Pesantren</div>
                <div class="sig-name">Moh. Syakur, M.S.I</div>

            </td>
            <td>
                <div class="sig-date">Semarang, {{ $tanggalCetak }}</div>
                <div class="sig-title">Bendahara,<br>{{ $kategoriNama }}</div>
                <div class="sig-name">Muhamad Taqwa</div>

            </td>
        </tr>
    </table>

</body>

</html>
