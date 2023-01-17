<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    public function employees()
    {
        return $this->hasMany(User::class);
    }

    public function receipts()
    {
        return $this->hasManyThrough(Receipt::class, User::class);
    }
}
