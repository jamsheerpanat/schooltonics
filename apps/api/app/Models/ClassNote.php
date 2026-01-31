<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_session_id',
        'content',
        'attachments',
        'posted_at',
    ];

    protected $casts = [
        'attachments' => 'json',
        'posted_at' => 'datetime',
    ];

    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }
}
