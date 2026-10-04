<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HaidRecord extends Model
{
    protected $table = 'haid_records';

    protected $fillable = [
        'santri_id',
        'tgl_mulai',
        'tgl_selesai',
        'durasi_hari',
        'status',
        'warna_darah',
        'catatan',
        'created_by',
    ];

    protected $casts = [
        'tgl_mulai' => 'datetime',
        'tgl_selesai' => 'datetime',
        'durasi_hari' => 'float',
    ];

    public function santri()
    {
        return $this->belongsTo(Santri::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
