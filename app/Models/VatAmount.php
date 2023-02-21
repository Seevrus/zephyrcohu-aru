<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VatAmount extends Model
{
    use HasFactory;

    public function receipt()
    {
        return $this->belongsTo(Receipt::class);
    }
}
