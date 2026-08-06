<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SantriController;
use App\Http\Controllers\UstadzController;
use App\Http\Controllers\WalisantriController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PresensiController;
use App\Http\Controllers\RekapController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PinjamGedungController;
use App\Http\Controllers\TimelineController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InventarisController;

// Auth
Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth');

// Authenticated
Route::middleware('auth')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index']);

    // Santri
    Route::get('/santri', [SantriController::class, 'index']);
    Route::post('/santri', [SantriController::class, 'store']);
    Route::put('/santri/{id}', [SantriController::class, 'update']);
    Route::delete('/santri/{id}', [SantriController::class, 'destroy']);

    // Ustadz
    Route::get('/ustadz', [UstadzController::class, 'index']);
    Route::post('/ustadz', [UstadzController::class, 'store']);
    Route::put('/ustadz/{id}', [UstadzController::class, 'update']);
    Route::delete('/ustadz/{id}', [UstadzController::class, 'destroy']);

    // Walisantri
    Route::get('/walisantri', [WalisantriController::class, 'index']);
    Route::post('/walisantri', [WalisantriController::class, 'store']);
    Route::put('/walisantri/{id}', [WalisantriController::class, 'update']);
    Route::delete('/walisantri/{id}', [WalisantriController::class, 'destroy']);

    // Pembayaran
    Route::get('/pembayaran', [PembayaranController::class, 'index']);
    Route::post('/pembayaran', [PembayaranController::class, 'store']);
    Route::put('/pembayaran/{id}', [PembayaranController::class, 'update']);
    Route::delete('/pembayaran/{id}', [PembayaranController::class, 'destroy']);
    Route::post('/pembayaran/{id}/cicilan', [PembayaranController::class, 'cicilan']);
    Route::post('/pembayaran/generate', [PembayaranController::class, 'generate']);
    Route::post('/pembayaran/{id}/upload-bukti', [PembayaranController::class, 'uploadBukti']);
    Route::post('/pembayaran/{id}/verifikasi', [PembayaranController::class, 'verifikasi']);

    // Kategori Pembayaran
    Route::post('/jenis-pembayaran', [PembayaranController::class, 'storeJenis']);
    Route::delete('/jenis-pembayaran/{id}', [PembayaranController::class, 'deleteJenis']);

    // Tagihan
    Route::get('/tagihan', [PembayaranController::class, 'tagihan']);

    // Presensi
    Route::get('/presensi', [PresensiController::class, 'index']);
    Route::post('/presensi', [PresensiController::class, 'store']);
    Route::delete('/presensi/{id}', [PresensiController::class, 'destroy']);

    // Rekap
    Route::get('/rekap', [RekapController::class, 'index']);
    Route::get('/rekap/santri', [RekapController::class, 'santri']);
    Route::get('/api/rekap/santri/{nis}', [RekapController::class, 'santriDetailJson']);
    Route::get('/rekap/spp', [RekapController::class, 'spp']);
    Route::get('/rekap/kitab', [RekapController::class, 'kitab']);
    Route::get('/rekap/kas', [RekapController::class, 'kas']);

    // Profil
    Route::get('/profil', [ProfileController::class, 'edit']);
    Route::put('/profil', [ProfileController::class, 'update']);
    Route::post('/profil/ganti-password', [ProfileController::class, 'gantiPassword']);

    // Pinjam Gedung
    Route::get('/pinjam-gedung', [PinjamGedungController::class, 'index']);
    Route::post('/pinjam-gedung', [PinjamGedungController::class, 'store']);
    Route::put('/pinjam-gedung/{id}', [PinjamGedungController::class, 'update']);
    Route::delete('/pinjam-gedung/{id}', [PinjamGedungController::class, 'destroy']);

    // QR
    Route::get('/qr', fn() => inertia('QR/Index'));

    // Timeline
    Route::get('/timeline', [TimelineController::class, 'index']);
    Route::post('/timeline', [TimelineController::class, 'store']);
    Route::put('/timeline/{id}', [TimelineController::class, 'update']);
    Route::delete('/timeline/{id}', [TimelineController::class, 'destroy']);
    Route::get('/inventaris', [InventarisController::class, 'index']);
    Route::post('/inventaris', [InventarisController::class, 'store']);
    Route::put('/inventaris/{id}', [InventarisController::class, 'update']);
    Route::delete('/inventaris/{id}', [InventarisController::class, 'destroy']);
});
