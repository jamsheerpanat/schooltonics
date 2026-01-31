import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import 'child_dashboard_screen.dart';

class OverviewScreen extends StatefulWidget {
  const OverviewScreen({super.key});

  @override
  State<OverviewScreen> createState() => _OverviewScreenState();
}

class _OverviewScreenState extends State<OverviewScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _children = [];
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
      
      // Fetch children
      final childrenResponse = await _apiService.get('/parent/children');
      final children = childrenResponse as List<dynamic>;

      // Fetch today's attendance for each child
      List<dynamic> updatedChildren = [];
      for (var child in children) {
        final attendanceResponse = await _apiService.get('/parent/child/${child['id']}/attendance?from=$date&to=$date');
        final attendance = attendanceResponse as List<dynamic>;
        
        updatedChildren.add({
          ...child,
          'today_attendance': attendance.isNotEmpty ? attendance[0] : null,
        });
      }

      setState(() {
        _children = updatedChildren;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Children'),
        actions: [
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
              : _children.isEmpty
                  ? _buildEmptyState()
                  : _buildChildrenList(),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.family_restroom, size: 80, color: Colors.grey),
          SizedBox(height: 20),
          Text('No children registered under this account.'),
        ],
      ),
    );
  }

  Widget _buildChildrenList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _children.length,
      itemBuilder: (context, index) {
        final child = _children[index];
        final attendance = child['today_attendance'];
        final bool hasAttendance = attendance != null;
        final bool isPresent = hasAttendance && attendance['status'] == 'present';

        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          child: InkWell(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => ChildDashboardScreen(child: child)),
            ),
            borderRadius: BorderRadius.circular(15),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 30,
                        backgroundColor: Colors.blue[100],
                        child: Text(
                          child['name_en'][0],
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.blue),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              child['name_en'],
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'Grade: ${child['current_enrollment']?['section']?['grade']?['name'] ?? 'N/A'}',
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right),
                    ],
                  ),
                  const Divider(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'TODAY\'S STATUS:',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: hasAttendance 
                              ? (isPresent ? Colors.green[50] : Colors.red[50])
                              : Colors.grey[100],
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: hasAttendance 
                                ? (isPresent ? Colors.green : Colors.red)
                                : Colors.grey,
                          ),
                        ),
                        child: Text(
                          hasAttendance 
                              ? (isPresent ? 'PRESENT' : 'ABSENT')
                              : 'NOT MARKED',
                          style: TextStyle(
                            color: hasAttendance 
                                ? (isPresent ? Colors.green : Colors.red)
                                : Colors.grey,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
