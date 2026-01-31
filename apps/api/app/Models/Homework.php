<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Homework extends Model
{
    use HasFactory;

    protected $table = 'homeworks';

    protected $fillable = [
        'class_session_id',
        'title',
        'instructions',
        'due_date',
        'attachments',
        'posted_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'attachments' => 'json',
        'posted_at' => 'datetime',
    ];

    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }
}
