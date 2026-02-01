# Sidebar Navigation - Complete Role-Based Menu

## Overview
The sidebar now includes **comprehensive role-based navigation** with all academic management pages properly organized by user role.

---

## Navigation by Role

### 👔 **Principal**

**Dashboard & Overview**
- 🏠 Dashboard → `/principal/health`
- 📊 Reports → `/principal/reports`

**Academic Management** (Shared with Office)
- 🏫 Academic Structure → `/office/academic`
- 👥 Students → `/office/students`
- 🎓 Teachers → `/office/teachers`
- 📚 Subjects → `/office/subjects`
- ⏰ Timetable → `/office/timetable`
- 📢 Announcements → `/office/announcements`
- 📅 Calendar → `/office/calendar`
- 💰 Fees → `/office/fees`
- 📊 Reports → `/office/reports`

**Total**: 11 menu items

---

### 🏢 **Office Staff**

**Dashboard**
- 🏠 Dashboard → `/office/announcements`

**Academic Management**
- 🏫 Academic → `/office/academic`
  - View academic structure
  - Manage grades & sections
  - View subjects overview
  
- 👥 Students → `/office/students`
  - Student directory
  - Search & filter students
  - View student profiles
  - Manage enrollments
  
- 🎓 Teachers → `/office/teachers`
  - Teacher directory
  - Search & filter teachers
  - View teacher profiles
  - Manage assignments
  
- 📚 Subjects → `/office/subjects`
  - Subject catalog
  - Add/edit subjects
  - Subject codes
  
- ⏰ Timetable → `/office/timetable`
  - Section timetables
  - Teacher timetables
  - Period configuration

**Operations**
- 📢 Announcements → `/office/announcements`
- 📅 Calendar → `/office/calendar`
- 💰 Fees → `/office/fees`
- 📊 Reports → `/office/reports`

**Total**: 11 menu items

---

### 👨‍🏫 **Teacher**

**Dashboard**
- 🏠 Dashboard → `/teacher/attendance`

**Teaching Tools**
- ✅ Attendance → `/teacher/attendance`
  - Mark attendance
  - View attendance history
  
- ⏰ My Timetable → `/teacher/timetable`
  - Weekly schedule
  - Class timings
  
- 👥 My Classes → `/teacher/classes`
  - Assigned sections
  - Student lists
  
- 📝 Assignments → `/teacher/assignments`
  - Create assignments
  - Grade submissions
  
- 🏆 Grades → `/teacher/grades`
  - Enter grades
  - View performance

**Shared Access**
- 📅 Calendar → `/office/calendar`
- ⏰ Timetable → `/office/timetable`

**Total**: 7 menu items

---

### 🎓 **Student**

**Dashboard**
- 🏠 Dashboard → `/student/today`

**My Learning**
- 📅 Today → `/student/today`
  - Today's schedule
  - Upcoming classes
  - Homework
  
- ⏰ Timetable → `/student/timetable`
  - Weekly schedule
  - Class timings
  
- 📝 Assignments → `/student/assignments`
  - View assignments
  - Submit work
  
- 🏆 Grades → `/student/grades`
  - View grades
  - Performance reports
  
- ✅ Attendance → `/student/attendance`
  - Attendance record
  - Absence history

**Total**: 6 menu items

---

### 👨‍👩‍👧 **Parent**

**Dashboard**
- 🏠 Dashboard → `/parent`

**Child Monitoring**
- 👥 My Children → `/parent/children`
  - Child profiles
  - Academic progress
  
- ✅ Attendance → `/parent/attendance`
  - Child's attendance
  - Absence notifications
  
- 🏆 Grades → `/parent/grades`
  - Child's grades
  - Performance reports
  
- 💰 Fees → `/parent/fees`
  - Fee status
  - Payment history
  
- 📢 Announcements → `/parent/announcements`
  - School announcements
  - Important notices

**Total**: 6 menu items

---

## Features Implemented

### ✅ **Role-Based Filtering**
- Automatically shows only relevant menu items based on user role
- No manual configuration needed
- Secure role checking from localStorage

### ✅ **Active State Highlighting**
- Current page highlighted in secondary color
- Bold font for active items
- Smart path matching (supports nested routes)

### ✅ **User Role Badge**
- Shows current user role at top of sidebar
- Visual indicator with role initial
- "Logged in as" label

### ✅ **Organized Structure**
- Logical grouping by function
- Consistent icon usage
- Clean, professional design

### ✅ **Shared Routes**
- Some routes accessible by multiple roles
- Principal has access to all office features
- Teachers can view timetables and calendar

---

## Icon Legend

| Icon | Meaning | Used For |
|------|---------|----------|
| 🏠 Home | Dashboard/Home | Main dashboard pages |
| 🏫 School | Academic | Academic structure |
| 👥 Users | People | Students, teachers, children |
| 🎓 GraduationCap | Education | Teachers, academic staff |
| 📚 BookOpen | Books | Subjects, curriculum |
| ⏰ Clock | Time | Timetables, schedules |
| 💰 DollarSign | Money | Fees, payments |
| 📊 FileBarChart | Analytics | Reports, statistics |
| 📢 Megaphone | Communication | Announcements |
| 📅 Calendar | Events | Calendar, events |
| ✅ UserCheck | Verification | Attendance |
| 📝 ClipboardList | Tasks | Assignments |
| 🏆 Award | Achievement | Grades, performance |
| ⚙️ Settings | Configuration | Settings |

---

## Technical Details

### **Route Configuration**
```typescript
interface Route {
    label: string;      // Display name
    icon: any;          // Lucide icon component
    href: string;       // Route path
    roles: string[];    // Allowed roles
}
```

### **Role Values**
- `"principal"` - School principal
- `"office"` - Office staff
- `"teacher"` - Teaching staff
- `"student"` - Students
- `"parent"` - Parents/Guardians

### **Active State Logic**
```typescript
const isActive = (href: string) => {
    if (href === pathname) return true;
    if (pathname.startsWith(href) && href !== '/') return true;
    return false;
};
```

---

## Page Hierarchy

### **Office/Principal Pages**

```
/office
├── /academic (Academic Structure Hub)
├── /students (Student Directory)
│   └── /[id] (Student Detail)
├── /teachers (Teacher Directory)
│   └── /[id] (Teacher Detail)
├── /subjects (Subjects Management)
├── /sections
│   └── /[id] (Section Detail)
├── /timetable (Timetable Hub)
│   ├── /section/[id] (Section Timetable)
│   └── /teacher/[id] (Teacher Timetable)
├── /announcements (Announcements)
├── /calendar (Calendar)
├── /fees (Fee Management)
└── /reports (Reports)
```

### **Teacher Pages**

```
/teacher
├── /attendance (Attendance Marking)
├── /timetable (My Timetable)
├── /classes (My Classes)
├── /assignments (Assignments)
└── /grades (Grade Entry)
```

### **Student Pages**

```
/student
├── /today (Today's Dashboard)
├── /timetable (My Timetable)
├── /assignments (My Assignments)
├── /grades (My Grades)
└── /attendance (My Attendance)
```

### **Parent Pages**

```
/parent
├── / (Dashboard)
├── /children (My Children)
├── /attendance (Child Attendance)
├── /grades (Child Grades)
├── /fees (Fee Status)
└── /announcements (Announcements)
```

---

## Usage Examples

### **For Office Staff**
1. Login as `office@octoschool.com`
2. See 11 menu items in sidebar
3. Navigate to "Students" → View directory
4. Click student → See full profile
5. Navigate to "Academic" → Manage structure

### **For Teachers**
1. Login as `teacher1@octoschool.com`
2. See 7 menu items in sidebar
3. Navigate to "Attendance" → Mark attendance
4. Navigate to "My Timetable" → View schedule
5. Navigate to "My Classes" → View students

### **For Students**
1. Login as `student1@octoschool.com`
2. See 6 menu items in sidebar
3. Navigate to "Today" → See today's schedule
4. Navigate to "Assignments" → View homework
5. Navigate to "Grades" → Check performance

---

## Summary

### **Total Navigation Items**: 41 unique routes

**By Role:**
- Principal: 11 items
- Office: 11 items
- Teacher: 7 items
- Student: 6 items
- Parent: 6 items

### **Features:**
✅ Role-based filtering  
✅ Active state highlighting  
✅ User role badge  
✅ Organized structure  
✅ Professional icons  
✅ Responsive design  
✅ Clean, modern UI  

---

**Status**: ✅ **COMPLETE**  
**Date**: 2026-01-31  
**Version**: 2.0
