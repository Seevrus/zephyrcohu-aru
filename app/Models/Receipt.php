<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'user_id',
        'serial_number',
        'year_code',
        'total_amount',
        'created_at',
    ];

    public $timestamps = false;

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function expirations()
    {
        return $this->belongsToMany(Expiration::class, 'receipt_expiration')->withPivot('quantity', 'item_amount');
    }
}
