import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';

class LearningFeedScreen extends StatefulWidget {
  const LearningFeedScreen({super.key});

  @override
  State<LearningFeedScreen> createState() => _LearningFeedScreenState();
}

class _LearningFeedScreenState extends State<LearningFeedScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String? _error;
  List<dynamic> _mergedFeed = [];

  @override
  void initState() {
    super.initState();
    _fetchFeed();
  }

  Future<void> _fetchFeed() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final now = DateTime.now();
      final fromDate = DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 14)));
      final toDate = DateFormat('yyyy-MM-dd').format(now);

      final results = await Future.wait([
        _apiService.get('/student/notes?from=$fromDate&to=$toDate'),
        _apiService.get('/student/homework?from=$fromDate&to=$toDate'),
      ]);

      final List<dynamic> notes = results[0] as List<dynamic>;
      final List<dynamic> homeworks = results[1] as List<dynamic>;

      // Tag items
      for (var note in notes) {
        note['_type'] = 'note';
        note['_sortDate'] = DateTime.parse(note['posted_at']);
      }
      for (var hw in homeworks) {
        hw['_type'] = 'homework';
        hw['_sortDate'] = DateTime.parse(hw['posted_at']);
      }

      // Merge and sort
      final List<dynamic> merged = [...notes, ...homeworks];
      merged.sort((a, b) => (b['_sortDate'] as DateTime).compareTo(a['_sortDate'] as DateTime));

      setState(() {
        _mergedFeed = merged;
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
        title: const Text('Learning Feed'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchFeed,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _mergedFeed.isEmpty
                  ? _buildEmptyState()
                  : _buildFeed(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.auto_stories, size: 64, color: Colors.grey[300]),
          const SizedBox(height: 16),
          const Text('No notes or homework yet.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildFeed() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _mergedFeed.length,
      itemBuilder: (context, index) {
        final item = _mergedFeed[index];
        final bool isNote = item['_type'] == 'note';
        
        // Grouping by date (Optional visual separator)
        bool showDateHeader = false;
        if (index == 0) {
          showDateHeader = true;
        } else {
          final prevDate = DateFormat('yyyy-MM-dd').format(_mergedFeed[index-1]['_sortDate']);
          final currDate = DateFormat('yyyy-MM-dd').format(item['_sortDate']);
          if (prevDate != currDate) showDateHeader = true;
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (showDateHeader)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
                child: Text(
                  DateFormat('EEEE, MMM dd').format(item['_sortDate']),
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blueGrey[700]),
                ),
              ),
            isNote ? _buildNoteCard(item) : _buildHomeworkCard(item),
          ],
        );
      },
    );
  }

  Widget _buildNoteCard(Map<String, dynamic> note) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.blue[100]!),
      ),
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.note, color: Colors.blue, size: 20),
                const SizedBox(width: 8),
                Text(
                  '${note['class_session']['subject']['name']} - Notes',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              note['content'],
              style: const TextStyle(fontSize: 15),
            ),
            if (note['attachments'] != null && (note['attachments'] as List).isNotEmpty)
              ...[
                const Divider(height: 24),
                const Text('Attachments:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 8,
                  children: (note['attachments'] as List).map((attr) => ActionChip(
                    avatar: const Icon(Icons.file_present, size: 16),
                    label: Text(attr['name'], style: const TextStyle(fontSize: 11)),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Downloading attachment...')));
                    },
                  )).toList(),
                ),
              ],
          ],
        ),
      ),
    );
  }

  Widget _buildHomeworkCard(Map<String, dynamic> hw) {
    final dueDate = DateTime.parse(hw['due_date']);
    final isOverdue = dueDate.isBefore(DateTime.now()) && !DateFormat('yyyy-MM-dd').format(dueDate).startsWith(DateFormat('yyyy-MM-dd').format(DateTime.now()));

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: isOverdue ? Colors.red[100]! : Colors.orange[100]!),
      ),
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      const Icon(Icons.assignment, color: Colors.orange, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        hw['title'],
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (isOverdue)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(4)),
                    child: const Text('OVERDUE', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Subject: ${hw['class_session']['subject']['name']}',
              style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
            ),
            const SizedBox(height: 8),
            Text(hw['instructions']),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.calendar_month, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  'Due: ${DateFormat('MMM dd').format(dueDate)}',
                  style: TextStyle(color: isOverdue ? Colors.red : Colors.grey[700], fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ],
            ),
            if (hw['attachments'] != null && (hw['attachments'] as List).isNotEmpty)
              ...[
                const Divider(height: 24),
                Wrap(
                  spacing: 8,
                  children: (hw['attachments'] as List).map((attr) => ActionChip(
                    avatar: const Icon(Icons.attach_file, size: 16),
                    label: Text(attr['name'], style: const TextStyle(fontSize: 11)),
                    onPressed: () {
                       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Downloading homework resource...')));
                    },
                  )).toList(),
                ),
              ],
          ],
        ),
      ),
    );
  }
}
