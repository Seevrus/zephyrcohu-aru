<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expiration extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'barcode',
        'expires_at',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function stores()
    {
        return $this
            ->belongsToMany(Store::class)
            ->using(ExpirationStore::class)
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
