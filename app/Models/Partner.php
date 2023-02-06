<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'store_id',
        'price_list_id',
        'code',
        'site_code',
        'name',
        'country',
        'postal_code',
        'city',
        'address',
        'vat_number',
        'iban',
        'bank_account',
        'phone_number',
        'email',
    ];

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
