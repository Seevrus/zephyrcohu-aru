<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StorageReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'company_code',
        'user_id',
        'user_user_name',
        'user_name',
        'user_phone_number',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function items()
    {
        return $this->hasMany(StorageReceiptItem::class);
    }
}
