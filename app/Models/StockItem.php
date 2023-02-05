<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class StockItem extends Pivot
{
    use HasFactory;

    protected $table = 'stock_item';
    public $incrementing = true;

    public function expirations()
    {
        return $this->hasMany(Expiration::class);
    }
}
