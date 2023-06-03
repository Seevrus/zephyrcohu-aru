<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    public function partners()
    {
        return $this->hasMany(Partner::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
