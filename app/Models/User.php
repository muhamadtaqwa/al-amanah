<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;

    protected $fillable = ['username', 'password', 'role'];
    protected $hidden = ['password', 'remember_token'];

    public function ustadz()
    {
        return $this->hasOne(Ustadz::class);
    }

    public function santri()
    {
        return $this->hasOne(Santri::class);
    }

    public function walisantri()
    {
        return $this->hasOne(Walisantri::class);
    }
}
