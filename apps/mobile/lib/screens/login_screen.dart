import 'package:flutter/material.dart';
import 'package:octoschool_mobile/screens/parent/overview_screen.dart';
import 'package:octoschool_mobile/screens/student/today_screen.dart';
import 'package:octoschool_mobile/screens/teacher/my_day_screen.dart';
import 'package:octoschool_mobile/services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login(String role) async {
    setState(() => _isLoading = true);

    // Simulate API delay
    await Future.delayed(const Duration(seconds: 1));
    
    // In real app, call ApiService().post('/auth/login', {...})
    // For now, save dummy token and navigate
    await ApiService().saveToken("dummy_token_role_$role");

    if (!mounted) return;
    setState(() => _isLoading = false);

    Widget nextScreen;
    switch (role) {
      case 'teacher':
        nextScreen = const MyDayScreen();
        break;
      case 'student':
        nextScreen = const TodayScreen();
        break;
      case 'parent':
        nextScreen = const OverviewScreen();
        break;
      default:
        nextScreen = const Center(child: Text("Unknown Role"));
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => nextScreen),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.school_rounded, size: 80, color: Colors.blueAccent),
              const SizedBox(height: 16),
              const Text(
                'OctoSchool Engine',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 40),
              
              if (_isLoading)
                 const Center(child: CircularProgressIndicator())
              else
                 Column(
                   crossAxisAlignment: CrossAxisAlignment.stretch,
                   children: [
                      ElevatedButton(
                        onPressed: () => _login('teacher'),
                        child: const Text('Login as Teacher'),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => _login('student'),
                        child: const Text('Login as Student'),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => _login('parent'),
                        child: const Text('Login as Parent'),
                      ),
                   ],
                 ),
            ],
          ),
        ),
      ),
    );
  }
}
