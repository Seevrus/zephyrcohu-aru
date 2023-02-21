<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'ci_serial_number',
        'ci_year_code',
        'serial_number',
        'year_code',
        'original_copies_printed',
        'vendor_name',
        'vendor_felir',
        'vendor_postal_code',
        'vendor_city',
        'vendor_address',
        'vendor_iban',
        'vendor_bank_account',
        'vendor_vat_number',
        'buyer_name',
        'buyer_postal_code',
        'buyer_city',
        'buyer_address',
        'buyer_bank_account',
        'buyer_delivery_name',
        'buyer_delivery_postal_code',
        'buyer_delivery_city',
        'buyer_delivery_address',
        'buyer_iban',
        'buyer_bank_account',
        'buyer_vat_number',
        'invoice_date',
        'fulfillment_date',
        'paid_method',
        'paid_date',
        'quantity',
        'agent_name',
        'agent_phone_number',
        'net_amount',
        'vat_amount',
        'gross_maount',
        'round_amount',
        'rounded_amount',
        'last_downloaded_at',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function vat_amounts()
    {
        return $this->hasMany(VatAmount::class);
    }

    public function receipt_items()
    {
        return $this->hasMany(ReceiptItem::class);
    }
}
