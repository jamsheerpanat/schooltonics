import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import 'child_attendance_screen.dart';
import '../common/fees_screen.dart';

class ChildDashboardScreen extends StatefulWidget {
  final Map<String, dynamic> child;

  const ChildDashboardScreen({super.key, required this.child});

  @override
  State<ChildDashboardScreen> createState() => _ChildDashboardScreenState();
}

class _ChildDashboardScreenState extends State<ChildDashboardScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String? _error;
  
  List<dynamic> _recentNotes = [];
  List<dynamic> _upcomingHomework = [];
  List<dynamic> _recentRecognitions = [];

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final from = DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 7)));
      final to = DateFormat('yyyy-MM-dd').format(now.add(const Duration(days: 7)));

      final results = await Future.wait([
        _apiService.get('/parent/child/${widget.child['id']}/notes?from=$from&to=$to'),
        _apiService.get('/parent/child/${widget.child['id']}/homework?from=$from&to=$to'),
        _apiService.get('/parent/child/${widget.child['id']}/recognition'),
      ]);

      setState(() {
        _recentNotes = results[0] as List<dynamic>;
        _upcomingHomework = results[1] as List<dynamic>;
        _recentRecognitions = results[2] as List<dynamic>;
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
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.child['name_en']),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Overview'),
              Tab(text: 'Attendance'),
              Tab(text: 'Learning'),
              Tab(text: 'Awards'),
              Tab(text: 'Fees'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildOverviewTab(),
            ChildAttendanceView(child: widget.child),
            _buildLearningTab(),
            _buildAwardsTab(),
            FeesScreen(studentId: widget.child['id']),
          ],
        ),
      ),
    );
  }


  Widget _buildOverviewTab() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    
    return RefreshIndicator(
      onRefresh: _fetchDashboardData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSummaryCard(
            title: 'School Participation',
            subtitle: 'Recent feedback from teachers',
            icon: Icons.auto_stories,
            color: Colors.blue,
            count: _recentNotes.length,
          ),
          const SizedBox(height: 16),
          _buildSummaryCard(
            title: 'Academic Tasks',
            subtitle: 'Homework and assignments',
            icon: Icons.assignment,
            color: Colors.orange,
            count: _upcomingHomework.length,
          ),
          const SizedBox(height: 16),
          _buildSummaryCard(
            title: 'Special Recognitions',
            subtitle: 'Moments of excellence',
            icon: Icons.emoji_events,
            color: Colors.amber,
            count: _recentRecognitions.length,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard({required String title, required String subtitle, required IconData icon, required Color color, required int count}) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
        side: BorderSide(color: color.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text(subtitle, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(10)),
              child: Text(
                count.toString(),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLearningTab() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    final List<dynamic> merged = [..._recentNotes, ..._upcomingHomework];
    merged.sort((a, b) {
       final dateA = DateTime.parse(a['posted_at'] ?? a['created_at']);
       final dateB = DateTime.parse(b['posted_at'] ?? b['created_at']);
       return dateB.compareTo(dateA);
    });

    if (merged.isEmpty) {
      return const Center(child: Text('No learning updates found for this week.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: merged.length,
      itemBuilder: (context, index) {
        final item = merged[index];
        final bool isNote = item.containsKey('content'); // Simple check for note vs homework
        
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: Icon(isNote ? Icons.note : Icons.assignment, color: isNote ? Colors.blue : Colors.orange),
            title: Text(isNote ? 'Class Note' : item['title']),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(isNote ? item['content'] : item['instructions'], maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text(
                  DateFormat('MMM dd').format(DateTime.parse(item['posted_at'] ?? item['created_at'])),
                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildAwardsTab() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    if (_recentRecognitions.isEmpty) {
      return const Center(child: Text('Keep up the good work! Awards will appear here.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _recentRecognitions.length,
      itemBuilder: (context, index) {
        final item = _recentRecognitions[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: const Icon(Icons.emoji_events, color: Colors.amber),
            title: Text(item['badge_code']),
            subtitle: Text(item['comment'] ?? 'Wonderful progress today!'),
            trailing: Text(
              DateFormat('MMM dd').format(DateTime.parse(item['posted_at'])),
              style: const TextStyle(fontSize: 10),
            ),
          ),
        );
      },
    );
  }
}

// Extract attendance logic into a view so it can be reused
class ChildAttendanceView extends StatefulWidget {
  final Map<String, dynamic> child;
  const ChildAttendanceView({super.key, required this.child});

  @override
  State<ChildAttendanceView> createState() => _ChildAttendanceViewState();
}

class _ChildAttendanceViewState extends State<ChildAttendanceView> {
  final ApiService _apiService = ApiService();
  List<dynamic> _records = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final now = DateTime.now();
      final from = DateFormat('yyyy-MM-dd').format(DateTime(now.year, now.month, 1));
      final to = DateFormat('yyyy-MM-dd').format(DateTime(now.year, now.month + 1, 0));
      final response = await _apiService.get('/parent/child/${widget.child['id']}/attendance?from=$from&to=$to');
      setState(() {
        _records = response as List<dynamic>;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_records.isEmpty) return const Center(child: Text('No attendance records this month.'));

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _records.length,
      itemBuilder: (context, index) {
        final r = _records[index];
        final isPresent = r['status'] == 'present';
        return ListTile(
          leading: Icon(isPresent ? Icons.check_circle : Icons.cancel, color: isPresent ? Colors.green : Colors.red),
          title: Text(DateFormat('EEEE, MMM dd').format(DateTime.parse(r['date']))),
          subtitle: r['reason'] != null ? Text(r['reason']) : null,
        );
      },
    );
  }
}
