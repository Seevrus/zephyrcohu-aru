<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VatAmount extends Model
{
    use HasFactory;

    protected $fillable = [
        'vat_rate',
        'net_amount',
        'vat_amount',
        'gross_amount',
    ];

    public function receipt()
    {
        return $this->belongsTo(Receipt::class);
    }
}
