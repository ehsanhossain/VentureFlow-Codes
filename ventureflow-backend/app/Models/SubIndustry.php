<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubIndustry extends Model
{
    protected $fillable = ['industry_id', 'name', 'status'];

    /**
     * Get the parent industry of the sub-industry.
     */
    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }
}
