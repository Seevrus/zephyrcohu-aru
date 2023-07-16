<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'cn_code',
        'article_number',
        'name',
        'short_name',
        'category',
        'unit_name',
        'product_catalog_code',
        'vat_rate',
        'net_price',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function discounts()
    {
        return $this->hasMany(Discount::class);
    }

    public function expirations()
    {
        return $this->hasMany(Expiration::class);
    }
}
