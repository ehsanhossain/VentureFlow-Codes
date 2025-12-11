<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    protected $fillable = [
        'currency_name',
        'currency_code',
        'currency_sign',
        'origin_country',
        'dollar_unit',
        'exchange_rate',
        'source',
    ];
}
