<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function stores()
    {
        return $this->belongsToMany(Store::class, 'stock_item')->using(StockItem::class)->withTimestamps();
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_item')->withPivot('quantity');
    }
}
