<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expiration extends Model
{
    use HasFactory;

    public $timestamps = false;

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }

    public function receipts()
    {
        return $this->belongsToMany(Receipt::class)->withPivot('quantity');
    }
}
