<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('izin_santri', function (Blueprint $table) {
            $table->date('tanggal_selesai')->nullable()->after('tanggal');
        });

        // Isi tanggal_selesai pada data lama sama dengan tanggal mulainya
        DB::table('izin_santri')
            ->whereNull('tanggal_selesai')
            ->update(['tanggal_selesai' => DB::raw('tanggal')]);
    }

    public function down(): void
    {
        Schema::table('izin_santri', function (Blueprint $table) {
            $table->dropColumn('tanggal_selesai');
        });
    }
};
