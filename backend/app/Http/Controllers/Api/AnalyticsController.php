<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Barangay;
use App\Models\Contractor;
use App\Models\Inspection;
use App\Models\Report;
use App\Models\Truck;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | DASHBOARD OVERVIEW
    |--------------------------------------------------------------------------
    */

    public function overview()
    {
        return response()->json([
            'success' => true,
            'message' => 'Analytics retrieved successfully.',

            'totals' => [
                'employees' => User::whereHas('roles', fn ($q) => $q->where('name', 'driver'))->count(),
                'contractors' => Contractor::count(),
                'vendors' => Vendor::count(),
                'reports' => Report::count(),
                'trucks' => Truck::count(),
            ],

            'reports_by_status' => Report::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status'),

            'trucks_by_status' => Truck::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status'),

            'employee_attendance' => $this->employeeAttendanceSummary(),

            'barangay_stats' => $this->barangayStats(),

            'market_compliance' => $this->marketCompliance(),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYEE PERFORMANCE (attendance-based)
    |--------------------------------------------------------------------------
    */

    private function employeeAttendanceSummary()
    {
        $employees = User::whereHas('roles', fn ($q) => $q->where('name', 'driver'))->get();

        return $employees->map(function ($employee) {
            $records = Attendance::where('user_id', $employee->id)->get();

            return [
                'id' => $employee->id,
                'name' => $employee->name,
                'present' => $records->where('status', 'present')->count(),
                'late' => $records->where('status', 'late')->count(),
                'absent' => $records->where('status', 'absent')->count(),
                'on_leave' => $records->where('status', 'on_leave')->count(),
                'total_days' => $records->count(),
            ];
        })->values();
    }


    /*
    |--------------------------------------------------------------------------
    | BARANGAY-LEVEL ANALYTICS
    |--------------------------------------------------------------------------
    */

    private function barangayStats()
    {
        $barangays = Barangay::withCount(['vendors', 'reports'])->get();

        return $barangays->map(function ($barangay) {
            return [
                'id' => $barangay->id,
                'name' => $barangay->name,
                'vendors' => $barangay->vendors_count,
                'reports' => $barangay->reports_count,
            ];
        })->values();
    }


    /*
    |--------------------------------------------------------------------------
    | MARKET COMPLIANCE SUMMARY
    |--------------------------------------------------------------------------
    */

    private function marketCompliance()
    {
        $flagged = Inspection::where('total_score', '<=', InspectionController::COMPLIANCE_FLAG_THRESHOLD)->count();
        $total = Inspection::count();

        return [
            'total_inspections' => $total,
            'flagged_markets' => $flagged,
            'threshold' => InspectionController::COMPLIANCE_FLAG_THRESHOLD,
        ];
    }
}
