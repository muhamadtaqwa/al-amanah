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
        Schema::create('aspirasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('santri_id')->nullable()->constrained('santris')->onDelete('cascade');
            $table->string('nama_pengirim');
            $table->boolean('is_anonim')->default(false);
            $table->text('pesan');
            $table->string('status', 30)->default('diterima'); // diterima, diproses, selesai
            $table->text('tanggapan')->nullable();
            $table->dateTime('tgl_tanggapan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aspirasis');
    }
};
