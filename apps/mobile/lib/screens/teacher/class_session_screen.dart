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

  @override
  void initState() {
    super.initState();
    _initializeAttendance();
  }

  Future<void> _initializeAttendance() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final date = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final response = await _apiService.post('/attendance/sessions', {
        'section_id': widget.classData['section']['id'],
        'date': date,
      });

      setState(() {
        _sessionId = response['session']['id'];
        _roster = response['roster'] as List<dynamic>;
        _isSubmitted = response['session']['status'] == 'submitted' || response['session']['status'] == 'locked';
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
                Tab(text: 'Notes (P4)'),
                Tab(text: 'Homework (P4)'),
                Tab(text: 'Recognition (P4)'),
              ],
            ),
          ),
          body: TabBarView(
            children: [
              _buildAttendanceTab(),
              const Center(child: Text('Notes - Locked for Phase 4')),
              const Center(child: Text('Homework - Phase 4')),
              const Center(child: Text('Recognition - Phase 4')),
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
            ElevatedButton(onPressed: _initializeAttendance, child: const Text('Retry')),
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

  Widget? _buildBottomBar() {
    if (_isLoading || _error != null || _isSubmitted) return null;

    return Container(
      padding: const EdgeInsets.all(16),
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
      child: ElevatedButton(
        onPressed: _isSubmitting ? null : _submitAttendance,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
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
    );
  }
}
