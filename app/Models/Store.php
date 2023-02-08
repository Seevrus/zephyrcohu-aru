<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'first_available_serial_number',
        'last_available_serial_number',
        'year_code',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function partners()
    {
        return $this->hasMany(Partner::class);
    }

    public function items()
    {
        return $this->belongsToMany(Item::class, 'stock_item')->using(StockItem::class)->withPivot('id')->withTimestamps();
    }
}
