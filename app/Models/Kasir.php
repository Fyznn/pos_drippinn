<?php

namespace App\Models;

// [PENTING] Harus use Authenticatable, bukan Model biasa
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Kasir extends Authenticatable
{
    use Notifiable;

    protected $table = 'kasir';
    protected $fillable = ['username', 'password'];
    
    // Sembunyikan password
    protected $hidden = [
        'password',
        'remember_token',
    ];
}