<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/v1/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => 'OctoSchoolEngine',
        'version' => 'v1',
    ]);
});

Route::prefix('v1/auth')->group(function () {
    Route::post('/login', function () {
        return response()->json(['message' => 'Not Implemented'], 501);
    });

    Route::post('/logout', function () {
        return response()->json(['message' => 'Not Implemented'], 501);
    })->middleware('auth:sanctum');

    Route::get('/me', function () {
        return response()->json(['message' => 'Not Implemented'], 501);
    })->middleware('auth:sanctum');
});
