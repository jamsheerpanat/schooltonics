<?php

namespace App\Services;

use App\Models\FeeItem;
use App\Models\StudentDue;
use App\Models\Enrollment;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class FeeService
{
    /**
     * Create a new fee item (definition).
     */
    public function createFeeItem(array $data, int $userId)
    {
        return DB::transaction(function () use ($data, $userId) {
            $feeItem = FeeItem::create($data);

            AuditLog::create([
                'user_id' => $userId,
                'action' => 'fee_item_created',
                'entity_type' => 'FeeItem',
                'entity_id' => $feeItem->id,
                'description' => "Fee item '{$feeItem->name}' created",
            ]);

            return $feeItem;
        });
    }

    /**
     * Assign dues to a student or a whole section.
     */
    public function assignDues(array $data, int $userId)
    {
        return DB::transaction(function () use ($data, $userId) {
            $feeItem = FeeItem::findOrFail($data['fee_item_id']);
            $amount = $data['amount'] ?? $feeItem->default_amount;
            $dueDate = $data['due_date'];

            if (!$amount) {
                throw new \Exception("Amount required if no default is set for the fee item.");
            }

            $assignedCount = 0;

            if ($data['target_type'] === 'student') {
                $this->createDue($data['target_id'], $feeItem->id, $amount, $dueDate);
                $assignedCount = 1;
            } elseif ($data['target_type'] === 'section') {
                $enrollments = Enrollment::where('section_id', $data['target_id'])
                    ->where('status', 'active')
                    ->get();

                foreach ($enrollments as $enrollment) {
                    $this->createDue($enrollment->student_id, $feeItem->id, $amount, $dueDate);
                    $assignedCount++;
                }
            } else {
                throw new \Exception("Invalid target type.");
            }

            AuditLog::create([
                'user_id' => $userId,
                'action' => 'dues_assigned',
                'entity_type' => 'FeeItem', // Using FeeItem as the anchor
                'entity_id' => $feeItem->id,
                'description' => "Assigned '{$feeItem->name}' dues to {$assignedCount} student(s) (Target: {$data['target_type']} #{$data['target_id']})",
            ]);

            return ['assigned_count' => $assignedCount];
        });
    }

    protected function createDue($studentId, $feeItemId, $amount, $dueDate)
    {
        StudentDue::create([
            'student_id' => $studentId,
            'fee_item_id' => $feeItemId,
            'amount' => $amount,
            'due_date' => $dueDate,
            'status' => 'unpaid',
        ]);
    }

    public function getStudentDues(int $studentId)
    {
        return StudentDue::where('student_id', $studentId)
            ->with('feeItem')
            ->orderBy('due_date', 'asc')
            ->get();
    }
}
