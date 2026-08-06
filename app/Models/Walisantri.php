<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Walisantri extends Model
{
    protected $table = 'walisantris';

    protected $fillable = [
        'user_id',
        'niw',
        'nama_lengkap',
        'no_whatsapp',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function santris()
    {
        return $this->hasMany(Santri::class);
    }
}