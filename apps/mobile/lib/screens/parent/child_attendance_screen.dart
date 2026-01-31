import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';

class ChildAttendanceScreen extends StatefulWidget {
  final Map<String, dynamic> child;

  const ChildAttendanceScreen({super.key, required this.child});

  @override
  State<ChildAttendanceScreen> createState() => _ChildAttendanceScreenState();
}

class _ChildAttendanceScreenState extends State<ChildAttendanceScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _attendanceRecords = [];
  bool _isLoading = true;
  String? _error;
  DateTime _currentMonth = DateTime.now();

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
      final firstDay = DateTime(_currentMonth.year, _currentMonth.month, 1);
      final lastDay = DateTime(_currentMonth.year, _currentMonth.month + 1, 0);
      
      final from = DateFormat('yyyy-MM-dd').format(firstDay);
      final to = DateFormat('yyyy-MM-dd').format(lastDay);
      
      final response = await _apiService.get('/parent/child/${widget.child['id']}/attendance?from=$from&to=$to');
      
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

  void _previousMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1);
    });
    _fetchAttendance();
  }

  void _nextMonth() {
    if (_currentMonth.month == DateTime.now().month && _currentMonth.year == DateTime.now().year) return;
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1);
    });
    _fetchAttendance();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.child['name_en']}\'s Attendance'),
      ),
      body: Column(
        children: [
          _buildMonthSelector(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Text('Error: $_error'))
                    : _attendanceRecords.isEmpty
                        ? const Center(child: Text('No attendance records found for this month.'))
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
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
                                    DateFormat('EEEE, MMM dd').format(DateTime.parse(record['date'])),
                                    style: const TextStyle(fontWeight: FontWeight.w500),
                                  ),
                                  trailing: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isPresent ? Colors.green[50] : Colors.red[50],
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: isPresent ? Colors.green : Colors.red),
                                    ),
                                    child: Text(
                                      record['status'].toString().toUpperCase(),
                                      style: TextStyle(
                                        color: isPresent ? Colors.green : Colors.red,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ),
                                  subtitle: record['reason'] != null ? Text(record['reason']) : null,
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildMonthSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      color: Colors.blue[50],
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: _previousMonth,
          ),
          Text(
            DateFormat('MMMM yyyy').format(_currentMonth),
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blueAccent),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: _nextMonth,
          ),
        ],
      ),
    );
  }
}
