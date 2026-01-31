import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';

class TodayScreen extends StatefulWidget {
  const TodayScreen({super.key});

  @override
  State<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends State<TodayScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _timetable = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchToday();
  }

  Future<void> _fetchToday() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final date = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final response = await _apiService.get('/student/today?date=$date');
      setState(() {
        _timetable = response as List<dynamic>;
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
            icon: const Icon(Icons.refresh),
            onPressed: _fetchToday,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _timetable.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.event_busy, size: 64, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          const Text('No classes today! Enjoy your day.'),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _fetchToday,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
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
                              trailing: isLive
                                  ? Container(
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
                                    )
                                  : Text(
                                      item['end_time'].substring(0, 5),
                                      style: TextStyle(color: Colors.grey[600]),
                                    ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
