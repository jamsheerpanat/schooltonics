import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../widgets/skeleton_loader.dart';
import '../../widgets/state_views.dart';
import '../../services/api_service.dart';
import 'class_session_screen.dart';

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

  Future<void> _fetchMyDay({bool forceRefresh = false}) async {
    // Only show loading indicator on first load or forced refresh if list is empty
    if (_classes.isEmpty) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
    }

    try {
      final date = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final response = await _apiService.get(
        '/teacher/my-day?date=$date', 
        useCache: true, 
        forceRefresh: forceRefresh
      );
      setState(() {
        _classes = response as List<dynamic>;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _openSession(Map<String, dynamic> classData) async {
    // If sessions already opened, just navigate
    if (classData['is_opened'] == true) {
      _navigateToClassSession(classData);
      return;
    }

    try {
      final date = DateFormat('yyyy-MM-dd').format(DateTime.now());
      await _apiService.post('/class-sessions/open', {
        'section_id': classData['section']['id'],
        'subject_id': classData['subject']['id'],
        'period_id': classData['period']['id'],
        'date': date,
      });

      if (!mounted) return;

      // Refresh to update session status
      await _fetchMyDay(forceRefresh: true);
      
      // Find the updated class data and navigate
      final updatedClass = _classes.firstWhere((c) => 
        c['section']['id'] == classData['section']['id'] && 
        c['subject']['id'] == classData['subject']['id'] &&
        c['period']['id'] == classData['period']['id']
      );

      _navigateToClassSession(updatedClass);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  void _navigateToClassSession(Map<String, dynamic> classData) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ClassSessionScreen(classData: classData),
      ),
    ).then((_) => _fetchMyDay(forceRefresh: true)); // Refresh when coming back in case state changed
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
            onPressed: () => _fetchMyDay(forceRefresh: true),
          ),
        ],
      ),

      body: _isLoading
          ? ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: 5,
              itemBuilder: (context, index) => const SkeletonCard(),
            )
          : _error != null
              ? ErrorView(
                  message: _error!,
                  onRetry: () => _fetchMyDay(forceRefresh: true),
                )
              : _classes.isEmpty
                  ? const EmptyStateView(
                      message: "No classes today! Enjoy your day off.",
                      icon: Icons.check_circle_outline,
                    )
                  : RefreshIndicator(
                      onRefresh: () => _fetchMyDay(forceRefresh: true),
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        physics: const AlwaysScrollableScrollPhysics(),
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
