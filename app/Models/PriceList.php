<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceList extends Model
{
    use HasFactory;

    public function price_list_items()
    {
        return $this->hasMany(PriceListItem::class);
    }
}
