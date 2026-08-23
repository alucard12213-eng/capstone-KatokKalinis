<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL REPORTS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = Report::with([
            'user:id,name,email',
            'barangay:id,name',
        ])->latest();

        /*
        |--------------------------------------------------------------------------
        | FILTER BY STATUS
        |--------------------------------------------------------------------------
        */

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $reports = $query->get();

        return response()->json([
            'success' => true,
            'reports' => $reports,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE REPORT
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $report = Report::with([
            'user:id,name,email',
            'barangay:id,name',
        ])->find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'report' => $report,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE REPORT STATUS
    |--------------------------------------------------------------------------
    */

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,reviewed,resolved,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid report information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found.',
            ], 404);
        }

        $report->status = $request->status;

        if ($request->has('admin_notes')) {
            $report->admin_notes = $request->admin_notes;
        }

        $report->save();

        $report->load([
            'user:id,name,email',
            'barangay:id,name',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report updated successfully.',
            'report' => $report,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE REPORT
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found.',
            ], 404);
        }

        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'Report deleted successfully.',
        ]);
    }
}

