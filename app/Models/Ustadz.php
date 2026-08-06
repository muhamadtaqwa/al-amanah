<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ustadz extends Model
{
    protected $table = 'ustadzs';

    protected $fillable = [
        'user_id',
        'niu',
        'nama_lengkap',
        'jenis_kelamin',
        'pendidikan_terakhir',
        'status',
        'nomor_hp',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
