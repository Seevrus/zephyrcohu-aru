<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Round extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'store_id',
        'partner_list_id',
        'last_serial_number',
        'year_code',
        'round_started',
        'round_finished',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
