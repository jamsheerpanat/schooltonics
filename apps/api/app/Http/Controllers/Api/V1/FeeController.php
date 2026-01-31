<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\FeeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeeController extends Controller
{
    protected $feeService;

    public function __construct(FeeService $feeService)
    {
        $this->feeService = $feeService;
    }

    public function storeItem(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'default_amount' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $item = $this->feeService->createFeeItem($request->all(), Auth::id());

        return response()->json($item, 201);
    }

    public function assignDues(Request $request)
    {
        $request->validate([
            'fee_item_id' => 'required|exists:fee_items,id',
            'target_type' => 'required|in:student,section',
            'target_id' => 'required|integer', // validation depends on type, keep generic or add complex rule
            'amount' => 'nullable|numeric|min:0',
            'due_date' => 'required|date',
        ]);

        $result = $this->feeService->assignDues($request->all(), Auth::id());

        return response()->json($result);
    }

    public function getStudentDues($studentId)
    {
        $dues = $this->feeService->getStudentDues($studentId);
        return response()->json($dues);
    }

    public function storeReceipt(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:cash,bank',
            'receipt_date' => 'nullable|date',
            'reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $receipt = $this->feeService->createReceipt($request->all(), Auth::id());

        return response()->json($receipt, 201);
    }

    public function getStudentReceipts($studentId)
    {
        $receipts = $this->feeService->getStudentReceipts($studentId);
        return response()->json($receipts);
    }
}
