import 'package:flutter/material.dart';

class MyDayScreen extends StatelessWidget {
  const MyDayScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Day - Teacher')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_month, size: 80, color: Colors.blue),
            SizedBox(height: 20),
            Text('No classes scheduled today!'),
          ],
        ),
      ),
    );
  }
}
