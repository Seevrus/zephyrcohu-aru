<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StorageReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'storage_receipt_id',
        'item_id',
        'cn_code',
        'article_number',
        'expires_at',
        'starting_quantity',
        'quantity_change',
        'final_quantity',
    ];
}
