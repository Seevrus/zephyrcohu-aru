<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    public $timestamps = false;

    public function employer()
    {
        return $this->belongsTo(Company::class);
    }

    public function receipts()
    {
        return $this->hasMany(Receipt::class);
    }
}
