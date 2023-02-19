<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    public function agents()
    {
        return $this->hasMany(Agent::class);
    }

    public function items()
    {
        return $this->hasMany(Item::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function partners()
    {
        return $this->hasMany(Partner::class);
    }

    public function partner_lists()
    {
        return $this->hasMany(PartnerList::class);
    }

    public function receipts()
    {
        return $this->hasMany(Receipt::class);
    }

    public function stores()
    {
        return $this->hasMany(Store::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
