<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'location_type', // C(enter), D(elivery)
        'country',
        'postal_code',
        'city',
        'address',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }
}
