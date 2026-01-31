<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'app' => 'OctoSchoolEngine',
            'version' => 'v1',
        ]);
    });

    Route::post('/auth/login', [AuthController::class, 'login']);
});

// Protected Routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Devices
    Route::post('/devices/register', [\App\Http\Controllers\Api\V1\DeviceController::class, 'register']);
    Route::post('/devices/unregister', [\App\Http\Controllers\Api\V1\DeviceController::class, 'unregister']);

    // Principal Routes
    Route::prefix('principal')->middleware('role:principal')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Principal Dashboard - Not Implemented'], 501);
        });
    });

    // Office Routes
    Route::prefix('office')->middleware('role:office,principal')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Office Dashboard - Not Implemented'], 501);
        });
    });

    // Teacher Routes
    Route::prefix('teacher')->middleware('role:teacher,principal')->group(function () {
        Route::get('/my-day', [\App\Http\Controllers\Api\V1\TeacherController::class, 'getMyDay']);
        Route::get('/classes', function () {
            return response()->json(['message' => 'Teacher Classes - Not Implemented'], 501);
        });
    });

    // Student Routes
    Route::prefix('student')->middleware('role:student,parent,principal')->group(function () {
        Route::get('/today', [\App\Http\Controllers\Api\V1\StudentController::class, 'getToday']);
        Route::get('/profile', function () {
            return response()->json(['message' => 'Student Profile - Not Implemented'], 501);
        });
    });

    // Parent Routes
    Route::middleware('role:parent,principal')->group(function () {
        Route::get('/parent/children', [\App\Http\Controllers\Api\V1\ParentController::class, 'getChildren']);
        Route::get('/parent/child/{studentId}/overview', [\App\Http\Controllers\Api\V1\ParentController::class, 'getChildOverview']);
    });

    // Academic Structure Management (Office + Principal)
    Route::middleware('role:office,principal')->group(function () {
        Route::post('/academic-years', [\App\Http\Controllers\Api\V1\AcademicController::class, 'storeAcademicYear']);
        Route::post('/academic-years/{id}/activate', [\App\Http\Controllers\Api\V1\AcademicController::class, 'activateAcademicYear']);
        Route::post('/grades', [\App\Http\Controllers\Api\V1\AcademicController::class, 'storeGrade']);
        Route::post('/sections', [\App\Http\Controllers\Api\V1\AcademicController::class, 'storeSection']);
        Route::post('/subjects', [\App\Http\Controllers\Api\V1\AcademicController::class, 'storeSubject']);
    });

    // Academic Structure Retrieval
    Route::get('/academic/structure', [\App\Http\Controllers\Api\V1\AcademicController::class, 'getStructure']);
    Route::get('/teachers', [\App\Http\Controllers\Api\V1\AcademicController::class, 'getTeachers']);

    // Student & Guardian Management (Office + Principal)
    Route::middleware('role:office,principal')->group(function () {
        Route::get('/students', [\App\Http\Controllers\Api\V1\StudentController::class, 'index']);
        Route::post('/students', [\App\Http\Controllers\Api\V1\StudentController::class, 'store']);
        Route::get('/students/{id}', [\App\Http\Controllers\Api\V1\StudentController::class, 'show']);
        Route::post('/students/{id}/enroll', [\App\Http\Controllers\Api\V1\StudentController::class, 'enroll']);

        Route::post('/guardians', [\App\Http\Controllers\Api\V1\GuardianController::class, 'store']);
        Route::post('/students/{id}/guardians/attach', [\App\Http\Controllers\Api\V1\GuardianController::class, 'attachToStudent']);
        Route::get('/students/{id}/guardians', [\App\Http\Controllers\Api\V1\GuardianController::class, 'getStudentGuardians']);

        Route::get('/teacher-assignments', [\App\Http\Controllers\Api\V1\TeacherAssignmentController::class, 'index']);
        Route::post('/teacher-assignments', [\App\Http\Controllers\Api\V1\TeacherAssignmentController::class, 'store']);

        Route::get('/periods', [\App\Http\Controllers\Api\V1\TimetableController::class, 'indexPeriods']);
        Route::post('/periods', [\App\Http\Controllers\Api\V1\TimetableController::class, 'storePeriod']);
        Route::post('/timetable-entries', [\App\Http\Controllers\Api\V1\TimetableController::class, 'storeTimetableEntry']);
    });

    // Timetable Retrieval
    Route::get('/timetable/section/{sectionId}', [\App\Http\Controllers\Api\V1\TimetableController::class, 'getBySection']);
    Route::get('/timetable/teacher/{teacherId}', [\App\Http\Controllers\Api\V1\TimetableController::class, 'getByTeacher']);

    // Class Sessions (Teacher + Principal)
    Route::middleware('role:teacher,principal')->group(function () {
        Route::post('/class-sessions/open', [\App\Http\Controllers\Api\V1\ClassSessionController::class, 'open']);
    });

    Route::get('/class-sessions/{id}', [\App\Http\Controllers\Api\V1\ClassSessionController::class, 'show']);

    // Attendance Routes
    Route::middleware('role:teacher,principal')->group(function () {
        Route::post('/attendance/sessions', [\App\Http\Controllers\Api\V1\AttendanceController::class, 'initializeSession']);
        Route::post('/attendance/sessions/{id}/submit', [\App\Http\Controllers\Api\V1\AttendanceController::class, 'submitSession']);
        Route::get('/attendance/section/{sectionId}', [\App\Http\Controllers\Api\V1\AttendanceController::class, 'getSectionAttendance']);
    });

    Route::middleware('role:student,principal')->group(function () {
        Route::get('/student/attendance', [\App\Http\Controllers\Api\V1\AttendanceController::class, 'getStudentAttendance']);
    });

    Route::middleware('role:parent,principal')->group(function () {
        Route::get('/parent/child/{studentId}/attendance', [\App\Http\Controllers\Api\V1\AttendanceController::class, 'getParentChildAttendance']);
    });

    Route::middleware('role:principal')->group(function () {
        Route::get('/principal/attendance/summary', [\App\Http\Controllers\Api\V1\AttendanceController::class, 'getPrincipalSummary']);
    });

    // Class Notes
    Route::middleware('role:teacher,principal')->group(function () {
        Route::post('/class-sessions/{id}/notes', [\App\Http\Controllers\Api\V1\ClassNoteController::class, 'store']);
        Route::get('/class-sessions/{id}/notes', [\App\Http\Controllers\Api\V1\ClassNoteController::class, 'show']);
    });

    Route::middleware('role:student,principal')->group(function () {
        Route::get('/student/notes', [\App\Http\Controllers\Api\V1\ClassNoteController::class, 'studentNotes']);
    });

    Route::middleware('role:parent,principal')->group(function () {
        Route::get('/parent/child/{studentId}/notes', [\App\Http\Controllers\Api\V1\ClassNoteController::class, 'parentNotes']);
    });
});
