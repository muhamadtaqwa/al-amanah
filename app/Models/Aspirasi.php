<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aspirasi extends Model
{
    protected $table = 'aspirasis';

    protected $fillable = [
        'santri_id',
        'nama_pengirim',
        'is_anonim',
        'pesan',
        'status',
        'tanggapan',
        'tgl_tanggapan',
    ];

    protected $casts = [
        'is_anonim' => 'boolean',
        'tgl_tanggapan' => 'datetime',
    ];

    public function santri()
    {
        return $this->belongsTo(Santri::class);
    }
}
