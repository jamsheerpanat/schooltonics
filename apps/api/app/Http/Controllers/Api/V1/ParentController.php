<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class ParentController extends Controller
{
    /**
     * Get children linked to the authenticated parent.
     */
    public function getChildren(Request $request)
    {
        $user = $request->user();

        // Find the guardian record for this user
        $guardian = $user->guardian;

        if (!$guardian) {
            return response()->json(['message' => 'No guardian record found for this user.'], 404);
        }

        return response()->json($guardian->students()->with('activeEnrollment.section.grade')->get());
    }

    /**
     * Get overview for a specific linked child.
     */
    public function getChildOverview(Request $request, $studentId)
    {
        $user = $request->user();
        $guardian = $user->guardian;

        if (!$guardian) {
            return response()->json(['message' => 'No guardian record found.'], 404);
        }

        // Ensure the student is linked to this guardian
        $student = $guardian->students()
            ->with(['activeEnrollment.section.grade', 'activeEnrollment.academicYear'])
            ->where('students.id', $studentId)
            ->first();

        if (!$student) {
            return response()->json(['message' => 'Access denied: This student is not linked to your account.'], 403);
        }

        return response()->json([
            'student' => $student,
            'summary' => 'Attendance: 95%, Late: 2, Performance: Good' // Placeholder for future logic
        ]);
    }
}
