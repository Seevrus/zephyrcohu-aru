<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'code',
        'site_code',
        'vat_number',
        'iban',
        'bank_account',
        'invoice_type',
        'invoice_copies',
        'payment_days',
        'original_copies',
        'phone_number',
        'email',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function partner_locations()
    {
        return $this->hasMany(PartnerLocation::class);
    }

    public function partner_lists()
    {
        return $this->belongsToMany(PartnerList::class, 'partner_partner_list');
    }

    public function items()
    {
        return $this->belongsToMany(Item::class, 'price_lists')->withPivot('net_price');
    }
}
