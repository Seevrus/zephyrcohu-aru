<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceiptOtherItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'article_number',
        'name',
        'quantity',
        'unit_name',
        'net_price',
        'net_amount',
        'vat_rate',
        'vat_amount',
        'gross_amount',
    ];

    public function receipt()
    {
        return $this->belongsTo(Receipt::class);
    }
}
