<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Santri extends Model
{
    protected $table = 'santris';

    protected $fillable = [
        'user_id',
        'walisantri_id',
        'nis',
        'nik',
        'nama_lengkap',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'program_studi',
        'angkatan',
        'kamar',
        'nomor_hp',
        'status',
        'qr_code',
        'poin_kedisiplinan',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function walisantri()
    {
        return $this->belongsTo(Walisantri::class);
    }
}
