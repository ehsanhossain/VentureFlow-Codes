<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuyersTargetPreferences extends Model
{
    protected $table = 'buyers_target_preferences';

    // Fillable attributes
    protected $fillable = [
        'b_ind_prefs',
        'n_ind_prefs',
        'target_countries',
        'main_market',
        'emp_count_range',
        'mgmt_retention',
        'years_in_biz',
        'timeline',
        'company_type',
        'cert',
    ];

    // Cast JSON fields to array
    protected $casts = [
        'b_ind_prefs' => 'array',
        'n_ind_prefs' => 'array',
        'target_countries' => 'array',
        'cert' => 'array',
    ];
}
