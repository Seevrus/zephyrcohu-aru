<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'product_id',
    ];

    public function receipt()
    {
        return $this->belongsTo(Receipt::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
