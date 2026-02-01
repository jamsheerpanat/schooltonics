<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunicationController extends Controller
{
    /**
     * Get announcements for teacher's classes
     */
    public function index(Request $request)
    {
        $teacher = $request->user();

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year'], 422);
        }

        $query = DB::table('announcements')
            ->leftJoin('sections', 'announcements.section_id', '=', 'sections.id')
            ->leftJoin('grades', 'sections.grade_id', '=', 'grades.id')
            ->where(function ($query) use ($activeYear) {
                $query->where('announcements.academic_year_id', $activeYear->id)
                    ->orWhereNull('announcements.academic_year_id');
            });

        if (!in_array($teacher->role, ['principal', 'office'])) {
            $query->where('announcements.created_by_user_id', $teacher->id);
        }

        $announcements = $query->select(
            'announcements.*',
            DB::raw("COALESCE(grades.name || ' - ' || sections.name, 'All Classes') as target_name")
        )
            ->orderBy('announcements.created_at', 'desc')
            ->get();

        return response()->json($announcements);
    }

    /**
     * Store a new announcement
     */
    public function store(Request $request)
    {
        $teacher = $request->user();

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'section_id' => 'nullable|exists:sections,id',
            'priority' => 'required|in:low,medium,high',
            'audience' => 'required|in:all,teacher,student,parent'
        ]);

        $activeYear = AcademicYear::where('is_active', true)->first();

        $id = DB::table('announcements')->insertGetId([
            'title' => $validated['title'],
            'body' => $validated['body'],
            'section_id' => $validated['section_id'] ?? null,
            'academic_year_id' => $activeYear ? $activeYear->id : null,
            'priority' => $validated['priority'],
            'audience' => $validated['audience'],
            'created_by_user_id' => $teacher->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(DB::table('announcements')->where('id', $id)->first(), 201);
    }
}
