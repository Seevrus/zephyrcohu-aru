<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'name',
        'type',
        'amount',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
