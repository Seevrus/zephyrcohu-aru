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
        'type',
        'state',
        'first_available_serial_number',
        'last_available_serial_number',
        'year_code',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function expirations()
    {
        return $this
            ->belongsToMany(Expiration::class)
            ->using(ExpirationStore::class)
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
