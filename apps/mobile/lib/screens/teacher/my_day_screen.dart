import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';

class MyDayScreen extends StatefulWidget {
  const MyDayScreen({super.key});

  @override
  State<MyDayScreen> createState() => _MyDayScreenState();
}

class _MyDayScreenState extends State<MyDayScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _classes = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchMyDay();
  }

  Future<void> _fetchMyDay() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final date = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final response = await _apiService.get('/teacher/my-day?date=$date');
      setState(() {
        _classes = response as List<dynamic>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _openSession(Map<String, dynamic> classData) async {
    try {
      final date = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final response = await _apiService.post('/class-sessions/open', {
        'section_id': classData['section']['id'],
        'subject_id': classData['subject']['id'],
        'period_id': classData['period']['id'],
        'date': date,
      });

      if (!mounted) return;

      // For now, just show a message or navigate to a placeholder
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Session opened for ${classData['subject']['name']}')),
      );
      
      // Refresh to update session id and opened status
      _fetchMyDay();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'current':
        return Colors.blue;
      case 'past':
        return Colors.grey;
      case 'upcoming':
        return Colors.orange;
      default:
        return Colors.black;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Day'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchMyDay,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _classes.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.calendar_today, size: 64, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          const Text('No classes scheduled for today'),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _fetchMyDay,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _classes.length,
                        itemBuilder: (context, index) {
                          final classData = _classes[index] as Map<String, dynamic>;
                          final status = classData['status'] as String;
                          final isCurrent = status == 'current';
                          final isPast = status == 'past';

                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            elevation: isCurrent ? 4 : 1,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: isCurrent
                                  ? const BorderSide(color: Colors.blue, width: 2)
                                  : BorderSide.none,
                            ),
                            child: Opacity(
                              opacity: isPast ? 0.6 : 1.0,
                              child: InkWell(
                                onTap: () => _openSession(classData),
                                borderRadius: BorderRadius.circular(12),
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Row(
                                    children: [
                                      // Time Column
                                      Column(
                                        children: [
                                          Text(
                                            classData['period']['start_time'].substring(0, 5),
                                            style: const TextStyle(fontWeight: FontWeight.bold),
                                          ),
                                          Container(
                                            width: 2,
                                            height: 30,
                                            color: _getStatusColor(status),
                                          ),
                                          Text(
                                            classData['period']['end_time'].substring(0, 5),
                                            style: TextStyle(color: Colors.grey[600], fontSize: 12),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(width: 20),
                                      // Details Column
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text(
                                                  classData['subject']['name'],
                                                  style: const TextStyle(
                                                    fontSize: 18,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                                _buildStatusBadge(status),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Section: ${classData['section']['grade']} - ${classData['section']['name']}',
                                              style: TextStyle(color: Colors.grey[700]),
                                            ),
                                            if (classData['is_opened'] == true)
                                              const Padding(
                                                padding: EdgeInsets.only(top: 8.0),
                                                child: Row(
                                                  children: [
                                                    Icon(Icons.check_circle, color: Colors.green, size: 16),
                                                    SizedBox(width: 4),
                                                    Text('Session Active', style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                                                  ],
                                                ),
                                              ),
                                          ],
                                        ),
                                      ),
                                      const Icon(Icons.chevron_right),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  Widget _buildStatusBadge(String status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getStatusColor(status).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _getStatusColor(status)),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: _getStatusColor(status),
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
