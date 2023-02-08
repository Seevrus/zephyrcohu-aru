<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'article_number',
        'name',
        'short_name',
        'category',
        'unit_name',
        'product_catalog_code',
        'vat_rate',
        'price',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function stores()
    {
        return $this->belongsToMany(Store::class, 'stock_item')->using(StockItem::class)->withPivot('id')->withTimestamps();
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_item')->withPivot('quantity');
    }
}
