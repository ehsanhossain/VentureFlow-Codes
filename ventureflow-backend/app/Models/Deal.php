<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Deal extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
        'seller_id',
        'name',
        'industry',
        'region',
        'estimated_ev_value',
        'estimated_ev_currency',
        'stage_code',
        'progress_percent',
        'priority',
        'pic_user_id',
        'target_close_date',
        'status',
        'comment_count',
        'attachment_count',
    ];

    protected $casts = [
        'estimated_ev_value' => 'decimal:2',
        'target_close_date' => 'date',
    ];

    // Stage definitions with progress percentages
    public const STAGES = [
        'K' => ['name' => 'Buyer Sourcing', 'progress' => 5],
        'J' => ['name' => 'Onboarding', 'progress' => 10],
        'I' => ['name' => 'Target Sourcing', 'progress' => 20],
        'H' => ['name' => 'Interest Check', 'progress' => 30],
        'G' => ['name' => 'NDA & IM Delivery', 'progress' => 40],
        'F' => ['name' => 'Top Meeting & IOI', 'progress' => 50],
        'E' => ['name' => 'LOI / Exclusivity', 'progress' => 65],
        'D' => ['name' => 'Due Diligence', 'progress' => 80],
        'C' => ['name' => 'SPA Negotiation', 'progress' => 90],
        'B' => ['name' => 'Deal Closing', 'progress' => 95],
        'A' => ['name' => 'Success', 'progress' => 100],
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class, 'seller_id');
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pic_user_id');
    }

    public function stageHistory(): HasMany
    {
        return $this->hasMany(DealStageHistory::class)->orderBy('changed_at', 'desc');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DealDocument::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(DealComment::class)->orderBy('created_at', 'desc');
    }

    public function getStageName(): string
    {
        return self::STAGES[$this->stage_code]['name'] ?? 'Unknown';
    }

    public function getStageProgress(): int
    {
        return self::STAGES[$this->stage_code]['progress'] ?? 0;
    }
}
