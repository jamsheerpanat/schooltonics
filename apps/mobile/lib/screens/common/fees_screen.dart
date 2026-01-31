import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import 'package:intl/intl.dart';

class FeesScreen extends StatefulWidget {
  final int? studentId; // If null, assumes current student ('/student/dues')
  
  const FeesScreen({super.key, this.studentId});

  @override
  State<FeesScreen> createState() => _FeesScreenState();
}

class _FeesScreenState extends State<FeesScreen> with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;
  
  List<dynamic> _dues = [];
  List<dynamic> _receipts = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      if (widget.studentId != null) {
        // Parent View
        final duesRes = await _apiService.get('/parent/child/${widget.studentId}/dues');
        final receiptsRes = await _apiService.get('/parent/child/${widget.studentId}/receipts');
        _dues = duesRes as List<dynamic>;
        _receipts = receiptsRes as List<dynamic>;
      } else {
        // Student View
        final duesRes = await _apiService.get('/student/dues');
        final receiptsRes = await _apiService.get('/student/receipts');
        _dues = duesRes as List<dynamic>;
        _receipts = receiptsRes as List<dynamic>;
      }
      
      setState(() {
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
        title: const Text('Fees & Payments'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: "Dues"),
            Tab(text: "Receipts"),
          ],
        ),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator()) 
        : _error != null 
          ? Center(child: Text('Error: $_error')) 
          : TabBarView(
            controller: _tabController,
            children: [
              _buildDuesList(),
              _buildReceiptsList(),
            ],
          ),
    );
  }

  Widget _buildDuesList() {
    if (_dues.isEmpty) return const Center(child: Text("No dues records found.", style: TextStyle(color: Colors.grey)));

    double totalDue = _dues.fold(0, (sum, item) => sum + double.parse(item['amount'].toString()));
    double unpaidTotal = _dues
        .where((item) => item['status'] != 'paid')
        .fold(0, (sum, item) => sum + double.parse(item['amount'].toString()));

    return Column(
      children: [
        if (unpaidTotal > 0)
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.red[50],
            child: Row(
              children: [
                Icon(Icons.warning_amber_rounded, color: Colors.red[700]),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Outstanding Balance", style: TextStyle(color: Colors.red[900], fontSize: 12)),
                    Text(
                      "\$${unpaidTotal.toStringAsFixed(2)}", 
                      style: TextStyle(color: Colors.red[900], fontSize: 20, fontWeight: FontWeight.bold)
                    ),
                  ],
                )
              ],
            ),
          ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: _dues.length,
            separatorBuilder: (c, i) => const Divider(),
            itemBuilder: (context, index) {
              final due = _dues[index];
              return ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(due['fee_item']['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text("Due: ${DateFormat('MMM dd, yyyy').format(DateTime.parse(due['due_date']))}"),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text("\$${double.parse(due['amount'].toString()).toStringAsFixed(2)}", style: const TextStyle(fontSize: 16)),
                    const SizedBox(height: 4),
                    _buildStatusBadge(due['status']),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildReceiptsList() {
    if (_receipts.isEmpty) return const Center(child: Text("No receipt history found.", style: TextStyle(color: Colors.grey)));

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _receipts.length,
      itemBuilder: (context, index) {
        final receipt = _receipts[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.green[100],
              child: Icon(Icons.check, color: Colors.green[800]),
            ),
            title: Text("\$${double.parse(receipt['amount'].toString()).toStringAsFixed(2)}", style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(DateFormat('MMM dd, yyyy').format(DateTime.parse(receipt['receipt_date']))),
            trailing: Chip(label: Text(receipt['method'].toString().toUpperCase(), style: const TextStyle(fontSize: 10))),
          ),
        );
      },
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String label;
    
    switch(status) {
      case 'paid': 
        color = Colors.green; 
        label = "PAID";
        break;
      case 'partial': 
        color = Colors.orange; 
        label = "PARTIAL";
        break;
      default: 
        color = Colors.red;
        label = "OUTSTANDING";
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.5))
      ),
      child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}
