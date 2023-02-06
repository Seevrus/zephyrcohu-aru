<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expiration extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_item_id',
        'expires_at',
        'quantity',
    ];

    public $timestamps = false;

    public function stock_item()
    {
        return $this->belongsTo(StockItem::class);
    }
}
