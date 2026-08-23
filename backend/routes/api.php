<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\ContractorController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\AttendanceController;

use App\Http\Middleware\SuperAdminMiddleware;


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);


/*
|--------------------------------------------------------------------------
| SUPER ADMIN ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    SuperAdminMiddleware::class
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | EMPLOYEES
    |--------------------------------------------------------------------------
    */

    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | CONTRACTORS
    |--------------------------------------------------------------------------
    */

    Route::get('/contractors', [ContractorController::class, 'index']);
    Route::post('/contractors', [ContractorController::class, 'store']);
    Route::get('/contractors/{id}', [ContractorController::class, 'show']);
    Route::put('/contractors/{id}', [ContractorController::class, 'update']);
    Route::delete('/contractors/{id}', [ContractorController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | CONTRACTS
    |--------------------------------------------------------------------------
    */

    Route::get('/contracts', [ContractController::class, 'index']);
    Route::post('/contracts', [ContractController::class, 'store']);
    Route::get('/contracts/{id}', [ContractController::class, 'show']);
    Route::put('/contracts/{id}', [ContractController::class, 'update']);
    Route::delete('/contracts/{id}', [ContractController::class, 'destroy']);

});


/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    Route::put('/reports/{id}/status', [ReportController::class, 'updateStatus']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| VENDORS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/vendors', [VendorController::class, 'index']);
    Route::post('/vendors', [VendorController::class, 'store']);
    Route::get('/vendors/{id}', [VendorController::class, 'show']);
    Route::put('/vendors/{id}', [VendorController::class, 'update']);
    Route::put('/vendors/{id}/status', [VendorController::class, 'updateStatus']);
    Route::delete('/vendors/{id}', [VendorController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| ATTENDANCE
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance', [AttendanceController::class, 'store']);
    Route::get('/attendance/{id}', [AttendanceController::class, 'show']);
    Route::put('/attendance/{id}', [AttendanceController::class, 'update']);
    Route::put('/attendance/{id}/status', [AttendanceController::class, 'updateStatus']);
    Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| ADMIN + SUPER ADMIN SETTINGS
|--------------------------------------------------------------------------
|
| These routes intentionally use only auth:sanctum.
| AuthController checks that the authenticated user has either:
|
| admin
| super_admin
|
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get(
        '/me',
        [AuthController::class, 'me']
    );

    Route::put(
        '/profile',
        [AuthController::class, 'updateProfile']
    );

    Route::put(
        '/change-password',
        [AuthController::class, 'changePassword']
    );

});