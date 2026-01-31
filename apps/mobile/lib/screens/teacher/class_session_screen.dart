import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import 'package:intl/intl.dart';

class ClassSessionScreen extends StatefulWidget {
  final Map<String, dynamic> classData;

  const ClassSessionScreen({super.key, required this.classData});

  @override
  State<ClassSessionScreen> createState() => _ClassSessionScreenState();
}

class _ClassSessionScreenState extends State<ClassSessionScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String? _error;
  
  int? _sessionId;
  List<dynamic> _roster = [];
  bool _isSubmitted = false;
  bool _isSubmitting = false;

  // Notes State
  final TextEditingController _notesController = TextEditingController();
  bool _isPostingNotes = false;
  Map<String, dynamic>? _existingNotes;

  // Homework State
  final TextEditingController _homeworkTitleController = TextEditingController();
  final TextEditingController _homeworkInstructionsController = TextEditingController();
  DateTime _dueDate = DateTime.now().add(const Duration(days: 1));
  bool _isPostingHomework = false;
  Map<String, dynamic>? _existingHomework;

  // Recognition State
  int? _selectedStudentId;
  String? _selectedBadge;
  final TextEditingController _recognitionCommentController = TextEditingController();
  bool _isPostingRecognition = false;
  List<dynamic> _currentSessionRecognitions = [];

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  Future<void> _initializeData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final date = DateFormat('yyyy-MM-dd').format(DateTime.now());
      
      // Initialize Session & Roster
      final sessionResponse = await _apiService.post('/attendance/sessions', {
        'section_id': widget.classData['section']['id'],
        'date': date,
      });

      _sessionId = sessionResponse['session']['id'];
      _roster = sessionResponse['roster'] as List<dynamic>;
      _isSubmitted = sessionResponse['session']['status'] == 'submitted' || sessionResponse['session']['status'] == 'locked';

      if (_sessionId != null) {
        // Fetch existing Notes/Homework/Recognitions if available
        // Note: These might fail if endpoints aren't perfectly aligned, so wrap in try-catch
        try {
          _existingNotes = await _apiService.get('/class-sessions/$_sessionId/notes');
          if (_existingNotes != null) {
            _notesController.text = _existingNotes!['content'] ?? '';
          }
        } catch (_) {}

        try {
          _existingHomework = await _apiService.get('/class-sessions/$_sessionId/homework');
          if (_existingHomework != null) {
            _homeworkTitleController.text = _existingHomework!['title'] ?? '';
            _homeworkInstructionsController.text = _existingHomework!['instructions'] ?? '';
            _dueDate = DateTime.parse(_existingHomework!['due_date']);
          }
        } catch (_) {}
      }

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _submitAttendance() async {
    if (_sessionId == null) return;
    
    setState(() => _isSubmitting = true);

    try {
      final records = _roster.map((student) => {
        'student_id': student['student_id'],
        'status': student['status'],
        'reason': student['reason'],
      }).toList();

      await _apiService.post('/attendance/sessions/$_sessionId/submit', {
        'records': records,
      });

      setState(() {
        _isSubmitted = true;
        _isSubmitting = false;
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Attendance submitted successfully!'), backgroundColor: Colors.green),
      );
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _postNotes() async {
    if (_sessionId == null || _notesController.text.isEmpty) return;
    setState(() => _isPostingNotes = true);

    try {
      final response = await _apiService.post('/class-sessions/$_sessionId/notes', {
        'content': _notesController.text,
        'attachments': [], // Placeholder for now
      });

      setState(() {
        _existingNotes = response;
        _isPostingNotes = false;
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Notes posted!'), backgroundColor: Colors.green),
      );
    } catch (e) {
      setState(() => _isPostingNotes = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _postHomework() async {
    if (_sessionId == null || _homeworkTitleController.text.isEmpty) return;
    setState(() => _isPostingHomework = true);

    try {
      final response = await _apiService.post('/class-sessions/$_sessionId/homework', {
        'title': _homeworkTitleController.text,
        'instructions': _homeworkInstructionsController.text,
        'due_date': DateFormat('yyyy-MM-dd').format(_dueDate),
        'attachments': [], 
      });

      setState(() {
        _existingHomework = response;
        _isPostingHomework = false;
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Homework assigned!'), backgroundColor: Colors.green),
      );
    } catch (e) {
      setState(() => _isPostingHomework = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _postRecognition() async {
    if (_sessionId == null || _selectedStudentId == null || _selectedBadge == null) return;
    setState(() => _isPostingRecognition = true);

    try {
      final response = await _apiService.post('/class-sessions/$_sessionId/recognition', {
        'student_id': _selectedStudentId,
        'badge_code': _selectedBadge,
        'comment': _recognitionCommentController.text,
      });

      setState(() {
        _currentSessionRecognitions.insert(0, response);
        _isPostingRecognition = false;
        _selectedBadge = null;
        _recognitionCommentController.clear();
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Recognition sent! 🌟'), backgroundColor: Colors.orange),
      );
    } catch (e) {
      setState(() => _isPostingRecognition = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  void _toggleStatus(int index) {
    if (_isSubmitted) return;
    
    setState(() {
      final currentStatus = _roster[index]['status'];
      _roster[index]['status'] = currentStatus == 'present' ? 'absent' : 'present';
      if (_roster[index]['status'] == 'present') {
        _roster[index]['reason'] = null;
      }
    });
  }

  void _setReason(int index, String? reason) {
    setState(() {
      _roster[index]['reason'] = reason;
    });
  }

  Future<bool> _onWillPop() async {
    if (_isSubmitted || _roster.isEmpty) return true;

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Attendance not submitted'),
        content: const Text('Are you sure you want to leave? Your changes will be lost.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('STAY'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('LEAVE', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: DefaultTabController(
        length: 4,
        child: Scaffold(
          appBar: AppBar(
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.classData['subject']['name'], style: const TextStyle(fontSize: 16)),
                Text(
                  'Section: ${widget.classData['section']['grade']} - ${widget.classData['section']['name']}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal),
                ),
              ],
            ),
            bottom: const TabBar(
              isScrollable: true,
              tabs: [
                Tab(text: 'Attendance'),
                Tab(text: 'Notes'),
                Tab(text: 'Homework'),
                Tab(text: 'Recognition'),
              ],
            ),
          ),
          body: TabBarView(
            children: [
              _buildAttendanceTab(),
              _buildNotesTab(),
              _buildHomeworkTab(),
              _buildRecognitionTab(),
            ],
          ),
          bottomNavigationBar: _buildBottomBar(),
        ),
      ),
    );
  }

  Widget _buildAttendanceTab() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $_error', style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _initializeData, child: const Text('Retry')),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _roster.length,
      itemBuilder: (context, index) {
        final student = _roster[index];
        final isAbsent = student['status'] == 'absent';

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Column(
            children: [
              ListTile(
                leading: CircleAvatar(
                  backgroundColor: isAbsent ? Colors.red[50] : Colors.green[50],
                  child: Text(
                    student['student_name'][0],
                    style: TextStyle(color: isAbsent ? Colors.red : Colors.green),
                  ),
                ),
                title: Text(student['student_name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('Roll No: ${student['roll_no'] ?? 'N/A'}'),
                trailing: Switch(
                  value: !isAbsent,
                  onChanged: _isSubmitted ? null : (_) => _toggleStatus(index),
                  activeColor: Colors.green,
                  activeTrackColor: Colors.green[100],
                  inactiveThumbColor: Colors.red,
                  inactiveTrackColor: Colors.red[100],
                ),
              ),
              if (isAbsent)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: DropdownButtonFormField<String>(
                    value: student['reason'],
                    decoration: const InputDecoration(
                      labelText: 'Reason for absence',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'Sick', child: Text('Sick')),
                      DropdownMenuItem(value: 'Family Emergency', child: Text('Family Emergency')),
                      DropdownMenuItem(value: 'Medical appointment', child: Text('Medical appointment')),
                      DropdownMenuItem(value: 'Other', child: Text('Other')),
                    ],
                    onChanged: _isSubmitted ? null : (v) => _setReason(index, v),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNotesTab() {
    final bool isPosted = _existingNotes != null;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Class Summary / Notes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 8),
          const Text('Share important highlights or study materials with students.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 16),
          TextField(
            controller: _notesController,
            enabled: !isPosted,
            maxLines: 8,
            decoration: InputDecoration(
              hintText: 'Enter your class notes here...',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              filled: true,
              fillColor: isPosted ? Colors.grey[100] : Colors.blue[50]?.withOpacity(0.1),
            ),
          ),
          const SizedBox(height: 16),
          if (!isPosted)
            ElevatedButton.icon(
              onPressed: _isPostingNotes ? null : _postNotes,
              icon: _isPostingNotes ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send),
              label: const Text('POST NOTES'),
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12)),
            )
          else
            const Card(
              color: Colors.green,
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.white),
                    SizedBox(width: 8),
                    Text('Notes are visible to students.', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHomeworkTab() {
    final bool isPosted = _existingHomework != null;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Assign Homework', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 16),
          TextField(
            controller: _homeworkTitleController,
            enabled: !isPosted,
            decoration: const InputDecoration(
              labelText: 'Homework Title',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _homeworkInstructionsController,
            enabled: !isPosted,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Instructions',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          ListTile(
            title: const Text('Due Date'),
            subtitle: Text(DateFormat('EEEE, MMM dd, yyyy').format(_dueDate)),
            trailing: const Icon(Icons.calendar_today),
            onTap: isPosted ? null : () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: _dueDate,
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (picked != null) setState(() => _dueDate = picked);
            },
          ),
          const SizedBox(height: 16),
          if (!isPosted)
            ElevatedButton(
              onPressed: _isPostingHomework ? null : _postHomework,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12)),
              child: _isPostingHomework ? const CircularProgressIndicator() : const Text('ASSIGN HOMEWORK'),
            )
          else
            const Card(
              color: Colors.blue,
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Row(
                  children: [
                    Icon(Icons.assignment_turned_in, color: Colors.white),
                    SizedBox(width: 8),
                    Text('Homework has been assigned.', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildRecognitionTab() {
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Spark Joy! ✨', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                const Text('Give a badge to a student who stood out today.', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 16),
                DropdownButtonFormField<int>(
                  value: _selectedStudentId,
                  decoration: const InputDecoration(labelText: 'Select Student', border: OutlineInputBorder()),
                  items: _roster.map((s) => DropdownMenuItem<int>(
                    value: s['student_id'],
                    child: Text(s['student_name']),
                  )).toList(),
                  onChanged: (v) => setState(() => _selectedStudentId = v),
                ),
                const SizedBox(height: 16),
                const Text('Select Badge', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildBadgeOption('PARTICIPATION', Icons.star, Colors.orange),
                    _buildBadgeOption('DISCIPLINE', Icons.shield, Colors.blue),
                    _buildBadgeOption('IMPROVEMENT', Icons.trending_up, Colors.green),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _recognitionCommentController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Comment (Optional)',
                    hintText: 'e.g. "Excellent work in the lab!"',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _isPostingRecognition ? null : _postRecognition,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: _isPostingRecognition ? const CircularProgressIndicator(color: Colors.white) : const Text('GIVE RECOGNITION'),
                ),
                if (_currentSessionRecognitions.isNotEmpty) ...[
                  const Divider(height: 32),
                  const Text('Given Today', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ..._currentSessionRecognitions.map((r) => ListTile(
                    leading: const Icon(Icons.emoji_events, color: Colors.orange),
                    title: Text(r['badge_code']),
                    subtitle: Text('Student ID: ${r['student_id']}'),
                  )).toList(),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBadgeOption(String code, IconData icon, Color color) {
    bool isSelected = _selectedBadge == code;
    return InkWell(
      onTap: () => setState(() => _selectedBadge = code),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSelected ? color : color.withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: color, width: 2),
            ),
            child: Icon(icon, color: isSelected ? Colors.white : color),
          ),
          const SizedBox(height: 4),
          Text(code, style: TextStyle(fontSize: 10, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }

  Widget? _buildBottomBar() {
    if (_isLoading || _error != null || _isSubmitted) return null;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            offset: const Offset(0, -4),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_roster.where((s) => s['status'] == 'absent').isNotEmpty)
            const Padding(
              padding: EdgeInsets.only(bottom: 8.0),
              child: Text(
                'Reminder: Specify reasons for absent students.',
                style: TextStyle(color: Colors.orange, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submitAttendance,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: _isSubmitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Text('SUBMIT ATTENDANCE', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
