<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    use HasFactory;

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function price_list()
    {
        return $this->belongsTo(PriceList::class);
    }

    public function receipts()
    {
        return $this->hasMany(Receipt::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
