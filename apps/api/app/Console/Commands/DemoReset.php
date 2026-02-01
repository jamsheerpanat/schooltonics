<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\App;

class DemoReset extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'demo:reset {--force : Force the operation to run when in production}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset the database and seed it with demo data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (App::environment('production') && !$this->option('force')) {
            $this->error('This command cannot be run in production without the --force flag.');
            return 1;
        }

        $this->info('Resetting database for Demo Mode...');

        $this->info('Migrating fresh...');
        Artisan::call('migrate:fresh', [
            '--force' => true,
        ]);
        $this->info(Artisan::output());

        $this->info('Seeding demo data...');
        Artisan::call('db:seed', [
            '--class' => 'DemoSeeder',
            '--force' => true,
        ]);
        $this->info(Artisan::output());

        $this->info('Optimizing configuration...'); // Optional: might be annoying in dev
        Artisan::call('optimize:clear');

        $this->info('Demo environment ready! 🚀');
        $this->table(
            ['Role', 'Email', 'Password'],
            [
                ['Principal', 'principal@octoschool.com', 'password'],
                ['Office', 'office@octoschool.com', 'password'],
                ['Teacher', 'teacher1@octoschool.com', 'password'],
                ['Student', 'student1@octoschool.com', 'password'],
                ['Parent', 'parent1@octoschool.com', 'password'],
            ]
        );

        return 0;
    }
}
