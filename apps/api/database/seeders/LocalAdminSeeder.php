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
            User::firstOrCreate(
                ['email' => 'admin@octoschool.com'],
                [
                    'name' => 'Local Admin',
                    'password' => Hash::make('password'),
                ]
            );
        }
    }
}
