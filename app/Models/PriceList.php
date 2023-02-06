<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceList extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'code',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function price_list_items()
    {
        return $this->hasMany(PriceListItem::class);
    }
}
