<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuyersPartnershipDetails extends Model
{

    protected $table = 'buyers_partnership_details';

    // Fillable fields for mass assignment
    protected $fillable = [
        'partnership_affiliation',
        'partner',
        'referral_bonus_criteria',
        'referral_bonus_amount',
        'mou_status',
        'specific_remarks',
        'partnership_affiliation', // If you choose to add this field
    ];

    public function partner(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Partner::class, 'partner');
    }
}
