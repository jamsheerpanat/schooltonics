import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';

class StudentAttendanceScreen extends StatefulWidget {
  const StudentAttendanceScreen({super.key});

  @override
  State<StudentAttendanceScreen> createState() => _StudentAttendanceScreenState();
}

class _StudentAttendanceScreenState extends State<StudentAttendanceScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _attendanceRecords = [];
  bool _isLoading = true;
  String? _error;
  DateTime _startDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _endDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _fetchAttendance();
  }

  Future<void> _fetchAttendance() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final from = DateFormat('yyyy-MM-dd').format(_startDate);
      final to = DateFormat('yyyy-MM-dd').format(_endDate);
      final response = await _apiService.get('/student/attendance?from=$from&to=$to');
      
      setState(() {
        _attendanceRecords = response as List<dynamic>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2025),
      lastDate: DateTime.now(),
      initialDateRange: DateTimeRange(start: _startDate, end: _endDate),
    );

    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
      _fetchAttendance();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Attendance History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_month),
            onPressed: _selectDateRange,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _attendanceRecords.isEmpty
                  ? const Center(child: Text('No attendance records found for this range.'))
                  : Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                            'From ${DateFormat('MMM dd, yyyy').format(_startDate)} to ${DateFormat('MMM dd, yyyy').format(_endDate)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blueAccent),
                          ),
                        ),
                        Expanded(
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _attendanceRecords.length,
                            itemBuilder: (context, index) {
                              final record = _attendanceRecords[index];
                              final bool isPresent = record['status'] == 'present';

                              return Card(
                                margin: const EdgeInsets.only(bottom: 8),
                                child: ListTile(
                                  leading: Icon(
                                    isPresent ? Icons.check_circle : Icons.cancel,
                                    color: isPresent ? Colors.green : Colors.red,
                                  ),
                                  title: Text(
                                    DateFormat('EEEE, MMM dd, yyyy').format(DateTime.parse(record['date'])),
                                    style: const TextStyle(fontWeight: FontWeight.w500),
                                  ),
                                  trailing: Text(
                                    record['status'].toString().toUpperCase(),
                                    style: TextStyle(
                                      color: isPresent ? Colors.green : Colors.red,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                  subtitle: record['reason'] != null ? Text('Reason: ${record['reason']}') : null,
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
    );
  }
}
