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
        Route::get('/classes', function () {
            return response()->json(['message' => 'Teacher Classes - Not Implemented'], 501);
        });
    });

    // Student Routes
    Route::prefix('student')->middleware('role:student,parent,principal')->group(function () {
        Route::get('/profile', function () {
            return response()->json(['message' => 'Student Profile - Not Implemented'], 501);
        });
    });

    // Parent Routes
    Route::prefix('parent')->middleware('role:parent,principal')->group(function () {
        Route::get('/children', function () {
            return response()->json(['message' => 'Parent Children - Not Implemented'], 501);
        });
    });
});
