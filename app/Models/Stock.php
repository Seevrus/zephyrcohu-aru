<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class Stock extends Pivot
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true;
    public $timestamps = false;

    public function expirations()
    {
        return $this->hasMany(Expiration::class);
    }
}
