<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recognition extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_session_id',
        'student_id',
        'badge_code',
        'comment',
        'posted_at',
    ];

    protected $casts = [
        'posted_at' => 'datetime',
    ];

    const ALLOWED_BADGES = [
        'PARTICIPATION',
        'DISCIPLINE',
        'IMPROVEMENT',
    ];

    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
