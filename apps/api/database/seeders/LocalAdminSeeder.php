<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class LocalAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->environment('local')) {
            $users = [
                [
                    'name' => 'Principal Account',
                    'email' => 'principal@octoschool.com',
                    'role' => 'principal',
                ],
                [
                    'name' => 'Office Admin',
                    'email' => 'office@octoschool.com',
                    'role' => 'office',
                ],
                [
                    'name' => 'Teacher account',
                    'email' => 'teacher@octoschool.com',
                    'role' => 'teacher',
                ],
                [
                    'name' => 'Parent account',
                    'email' => 'parent@octoschool.com',
                    'role' => 'parent',
                ],
                [
                    'name' => 'Student account',
                    'email' => 'student@octoschool.com',
                    'role' => 'student',
                ],
                [
                    'name' => 'Inactive User',
                    'email' => 'inactive@octoschool.com',
                    'role' => 'student',
                    'status' => 'inactive',
                ],
            ];

            foreach ($users as $userData) {
                User::updateOrCreate(
                    ['email' => $userData['email']],
                    array_merge($userData, [
                        'password' => Hash::make('password'),
                        'status' => $userData['status'] ?? 'active',
                    ])
                );
            }
        }
    }
}
