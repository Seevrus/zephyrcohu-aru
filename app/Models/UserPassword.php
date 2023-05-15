<?php

namespace App\Models;

use DateTime;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPassword extends Model
{
    use HasFactory;

    protected $dateFormat = DateTime::ATOM;
    protected $timestamps = false;

    protected $fillable = [
        'user_id',
        'password',
        'set_time',
        'is_generated',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
