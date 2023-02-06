<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceListItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'price_list_id',
        'item_id',
        'price',
    ];

    public $timestamps = false;

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function price_list()
    {
        return $this->belongsTo(PriceList::class);
    }
}
