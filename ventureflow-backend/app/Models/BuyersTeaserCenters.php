<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuyersTeaserCenters extends Model
{
    // Define the table name
    protected $table = 'buyers_teaser_centers';

    // Specify the fillable attributes
    protected $fillable = [
        'teaser_heading',
        'b_in',
        'target_countries',
        'emp_count_range',
        'expected_ebitda',
        'acquire_pct',
        'valuation_range',
        'investment_amount',
        'growth_rate_yoy',

        'has_teaser_description',
        'has_border_industry_preference',
        'has_buyer_targeted_countries',
        'has_emp_count_range',
        'has_expected_ebitda',
        'has_acquiring_percentage',
        'has_valuation_range',
        'has_investment_amount',
        'has_growth_rate_yoy',
        'has_teaser_name',
        'has_industry',
    ];

    // Define the type casting for specific attributes
    protected $casts = [
        'b_in' => 'array',
        'target_countries' => 'array',
        'expected_ebitda' => 'array',
        'acquire_pct' => 'array',
        'valuation_range' => 'array',

        'has_teaser_description' => 'boolean',
        'has_border_industry_preference' => 'boolean',
        'has_buyer_targeted_countries' => 'boolean',
        'has_emp_count_range' => 'boolean',
        'has_expected_ebitda' => 'boolean',
        'has_acquiring_percentage' => 'boolean',
        'has_valuation_range' => 'boolean',
        'has_investment_amount' => 'boolean',
        'has_growth_rate_yoy' => 'boolean',
        'has_teaser_name' => 'boolean',
        'has_industry' => 'boolean',
    ];
}
