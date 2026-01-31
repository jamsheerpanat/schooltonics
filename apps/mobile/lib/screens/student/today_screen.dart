import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import 'attendance_screen.dart';

class TodayScreen extends StatefulWidget {
  const TodayScreen({super.key});

  @override
  State<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends State<TodayScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _timetable = [];
  Map<String, dynamic>? _todayAttendance;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final date = DateFormat('yyyy-MM-dd').format(DateTime.now());
      
      // Fetch both timetable and attendance
      final results = await Future.wait([
        _apiService.get('/student/today?date=$date'),
        _apiService.get('/student/attendance?from=$date&to=$date'),
      ]);

      setState(() {
        _timetable = results[0] as List<dynamic>;
        final attendanceList = results[1] as List<dynamic>;
        if (attendanceList.isNotEmpty) {
          _todayAttendance = attendanceList[0];
        } else {
          _todayAttendance = null;
        }
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Today's Classes"),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const StudentAttendanceScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : Column(
                  children: [
                    _buildAttendanceSummary(),
                    Expanded(
                      child: _timetable.isEmpty
                          ? _buildEmptyState()
                          : _buildTimetable(),
                    ),
                  ],
                ),
    );
  }

  Widget _buildAttendanceSummary() {
    final bool hasAttendance = _todayAttendance != null;
    final bool isPresent = hasAttendance && _todayAttendance!['status'] == 'present';

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: hasAttendance 
            ? (isPresent ? Colors.green[50] : Colors.red[50])
            : Colors.blue[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: hasAttendance 
              ? (isPresent ? Colors.green : Colors.red)
              : Colors.blueAccent,
        ),
      ),
      child: Row(
        children: [
          Icon(
            hasAttendance 
                ? (isPresent ? Icons.check_circle : Icons.cancel)
                : Icons.info_outline,
            color: hasAttendance 
                ? (isPresent ? Colors.green : Colors.red)
                : Colors.blueAccent,
            size: 32,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Daily Attendance',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                Text(
                  hasAttendance 
                      ? (isPresent ? 'You are present today' : 'You are marked absent')
                      : 'Attendance not yet marked',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          Text(
            DateFormat('MMM dd').format(DateTime.now()),
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.event_busy, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          const Text('No classes today! Enjoy your day.'),
        ],
      ),
    );
  }

  Widget _buildTimetable() {
    return RefreshIndicator(
      onRefresh: _fetchData,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _timetable.length,
        itemBuilder: (context, index) {
          final item = _timetable[index];
          final bool isLive = item['is_session_open'] == true;

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    item['start_time'].substring(0, 5),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const Icon(Icons.arrow_drop_down, size: 12),
                ],
              ),
              title: Text(
                item['subject'],
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Text("${item['period']} • ${item['teacher']}"),
              trailing: isLive ? _buildLiveBadge() : Text(
                item['end_time'].substring(0, 5),
                style: TextStyle(color: Colors.grey[600]),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildLiveBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green),
      ),
      child: const Text(
        'LIVE',
        style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
