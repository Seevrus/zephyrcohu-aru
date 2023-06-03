<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'company_id',
        'code',
        'user_name',
        'password',
        'name',
        'phone_number',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function roles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function passwords()
    {
        return $this->hasMany(UserPassword::class);
    }
}
