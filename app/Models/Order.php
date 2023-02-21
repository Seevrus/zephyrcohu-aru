<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'order_date',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function order_items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
