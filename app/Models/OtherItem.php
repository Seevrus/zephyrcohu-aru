<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtherItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'article_number',
        'name',
        'short_name',
        'unit_name',
        'vat_rate',
        'net_price',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
