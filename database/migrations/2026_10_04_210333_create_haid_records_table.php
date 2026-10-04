<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('haid_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
            $table->dateTime('tgl_mulai');
            $table->dateTime('tgl_selesai')->nullable();
            $table->decimal('durasi_hari', 5, 1)->nullable();
            $table->string('status', 20)->default('haid'); // haid, istihadhah, suci
            $table->string('warna_darah', 50)->nullable(); // merah, hitam, cokelat, kuning/keruh
            $table->text('catatan')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('haid_records');
    }
};
