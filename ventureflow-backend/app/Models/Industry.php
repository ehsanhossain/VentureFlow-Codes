<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Industry extends Model
{
    protected $fillable = ['name', 'status'];

    public function subIndustries(): HasMany
    {
        return $this->hasMany(SubIndustry::class);
    }
}
