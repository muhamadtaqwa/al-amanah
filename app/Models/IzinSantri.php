<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IzinSantri extends Model
{
    protected $table = 'izin_santri';

    protected $fillable = ['nis', 'tanggal', 'keterangan'];

    public function santri()
    {
        return $this->belongsTo(Santri::class, 'nis', 'nis');
    }
}
