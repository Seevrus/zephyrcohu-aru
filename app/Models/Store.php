<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function partners()
    {
        return $this->hasMany(Partner::class);
    }

    public function items()
    {
        return $this->belongsToMany(Item::class, 'stocks')->using(Stock::class);
    }
}
