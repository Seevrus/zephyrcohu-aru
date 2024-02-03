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
        'user_name',
        'state',
        'name',
        'phone_number',
        'attempts',
        'created_at',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function roles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function roleList()
    {
        return array_map(fn ($role) => $role['role'], $this->roles->toArray());
    }

    public function passwords()
    {
        return $this->hasMany(UserPassword::class);
    }

    public function store()
    {
        return $this->hasOne(Store::class);
    }

    public function rounds()
    {
        return $this->hasMany(Round::class);
    }
}
