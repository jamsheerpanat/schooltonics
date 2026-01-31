<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Guardian;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class GuardianController extends Controller
{
    /**
     * Create a new guardian and a corresponding user account.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:guardians|unique:users',
            'relation' => 'required|string|max:50',
            'password' => 'nullable|string|min:8',
        ]);

        return DB::transaction(function () use ($validated) {
            // Create user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password'] ?? 'parent123'),
                'role' => 'parent',
                'status' => 'active',
            ]);

            // Create guardian
            $guardian = Guardian::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'relation' => $validated['relation'],
            ]);

            return response()->json($guardian->load('user'), 201);
        });
    }

    /**
     * Attach a guardian to a student.
     */
    public function attachToStudent(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $validated = $request->validate([
            'guardian_id' => 'required|exists:guardians,id',
            'is_primary' => 'boolean',
        ]);

        $student->guardians()->syncWithoutDetaching([
            $validated['guardian_id'] => ['is_primary' => $validated['is_primary'] ?? false]
        ]);

        return response()->json(['message' => 'Guardian attached successfully.']);
    }

    /**
     * Get guardians for a specific student.
     */
    public function getStudentGuardians($id)
    {
        $student = Student::with('guardians')->findOrFail($id);
        return response()->json($student->guardians);
    }
}
