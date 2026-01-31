<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_no',
        'name_en',
        'dob',
        'gender',
        'status',
    ];

    protected $casts = [
        'dob' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($student) {
            if (!$student->student_no) {
                $lastStudent = static::orderBy('id', 'desc')->first();
                $lastId = $lastStudent ? $lastStudent->id : 0;
                $student->student_no = 'STU-' . str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function activeEnrollment(): HasOne
    {
        return $this->hasOne(Enrollment::class)->where('status', 'active');
    }

    public function guardians(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Guardian::class, 'student_guardians')
            ->withPivot('is_primary')
            ->withTimestamps();
    }
}
