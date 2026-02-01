# Bug Fix: 500 Error on Student Detail Page

## Issue
**Error**: `Request failed with status code 500`  
**Root Cause**: Invalid input syntax for type bigint: "new"

## Problem Analysis

When clicking "Add Student" button, the app navigated to `/office/students/new`. However, Next.js treated this as a dynamic route `/office/students/[id]` where `id = "new"`.

The frontend then tried to fetch student data with:
```
GET /api/v1/students/new
```

The Laravel backend tried to execute:
```sql
SELECT * FROM students WHERE id = 'new'
```

This caused a PostgreSQL error because 'new' is not a valid bigint.

---

## Solution

### 1. **Created Add Student Page** ✅
- **File**: `apps/web/app/(dashboard)/office/students/new/page.tsx`
- **Route**: `/office/students/new`
- **Features**:
  - Form with name, DOB, gender fields
  - Validation
  - API integration
  - Success/error handling
  - Redirect to student detail after creation

### 2. **Created Add Teacher Page** ✅
- **File**: `apps/web/app/(dashboard)/office/teachers/new/page.tsx`
- **Route**: `/office/teachers/new`
- **Features**:
  - Form with name, email, phone, subject
  - Placeholder for future API integration
  - Cancel/Submit buttons

### 3. **Fixed Student Controller** ✅
- **File**: `apps/api/app/Http/Controllers/Api/V1/StudentController.php`
- **Changes**:
  - Added `guardians` relationship to `show()` method
  - Updated `index()` to load `enrollments` properly
  - Both methods now return complete data

---

## Technical Details

### Next.js Route Priority

In Next.js, static routes take precedence over dynamic routes:

```
/office/students/new       ← Static route (higher priority)
/office/students/[id]      ← Dynamic route (lower priority)
```

By creating `/office/students/new/page.tsx`, Next.js now correctly routes:
- `/office/students/new` → Add Student Page
- `/office/students/123` → Student Detail Page

### Backend Updates

**Before**:
```php
public function show($id) {
    $student = Student::with(['enrollments.section.grade', 'enrollments.academicYear'])
        ->findOrFail($id);
    return response()->json($student);
}
```

**After**:
```php
public function show($id) {
    $student = Student::with([
        'enrollments.section.grade', 
        'enrollments.academicYear',
        'guardians'  // ← Added
    ])->findOrFail($id);
    
    return response()->json($student);
}
```

---

## Features Added

### Add Student Form
- ✅ Full name input
- ✅ Date of birth picker
- ✅ Gender selection (male/female/other)
- ✅ Form validation
- ✅ API integration with POST `/students`
- ✅ Success toast notification
- ✅ Auto-redirect to student profile
- ✅ Cancel button
- ✅ Next steps information card

### Add Teacher Form
- ✅ Full name input
- ✅ Email input
- ✅ Phone number input
- ✅ Primary subject input
- ✅ Placeholder for API integration
- ✅ Cancel/Submit buttons
- ✅ Next steps information card

---

## Testing

### Test Add Student:
1. Go to `/office/students`
2. Click "Add Student" button
3. Fill in the form:
   - Name: "John Doe"
   - DOB: "2010-01-15"
   - Gender: "Male"
4. Click "Add Student"
5. Should redirect to student detail page
6. Should show success toast

### Test Add Teacher:
1. Go to `/office/teachers`
2. Click "Add Teacher" button
3. Fill in the form
4. Click "Add Teacher"
5. Should show "coming soon" message
6. Should redirect back to teachers list

### Test Student Detail:
1. Go to `/office/students`
2. Click any existing student
3. Should load student detail page
4. Should show all tabs
5. No 500 error

---

## Files Modified

### Frontend:
1. ✅ `apps/web/app/(dashboard)/office/students/new/page.tsx` (NEW)
2. ✅ `apps/web/app/(dashboard)/office/teachers/new/page.tsx` (NEW)

### Backend:
3. ✅ `apps/api/app/Http/Controllers/Api/V1/StudentController.php` (MODIFIED)

---

## Summary

✅ **Fixed 500 error** on student detail page  
✅ **Created Add Student form** with full functionality  
✅ **Created Add Teacher form** with placeholder  
✅ **Updated backend** to load guardians relationship  
✅ **Improved data loading** in student index  

**Status**: ✅ **COMPLETE**  
**Error**: ✅ **RESOLVED**  
**Date**: 2026-01-31
