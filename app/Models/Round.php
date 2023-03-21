<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Round extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'agent_code',
        'agent_name',
        'store_code',
        'store_name',
        'round_at',
        'last_serial_number',
        'year_code',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
