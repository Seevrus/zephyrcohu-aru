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

    public function partnerLists()
    {
        return $this->hasMany(PartnerList::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function items()
    {
        return $this->hasMany(Item::class);
    }

    public function priceLists()
    {
        return $this->hasMany(PriceList::class);
    }

    public function otherItems()
    {
        return $this->hasMany(OtherItem::class);
    }

    public function stores()
    {
        return $this->hasMany(Store::class);
    }

    public function rounds()
    {
        return $this->hasMany(Round::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function receipts()
    {
        return $this->hasMany(Receipt::class);
    }

    public function storageReceipts()
    {
        return $this->hasMany(StorageReceipt::class);
    }
}
