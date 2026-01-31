<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\RequestIdMiddleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(RequestIdMiddleware::class);
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                $message = $e->getMessage();

                // Friendly generic message for 500s unless debug enabled
                if ($status === 500 && !config('app.debug')) {
                    $message = 'Something went wrong. Please try again.';
                }

                // Polished 403 message
                if ($status === 403) {
                    $message = 'You don’t have access to this section.';
                }



                // If validation exception, Laravel handles it, but let's ensure structure
    
                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'error_code' => $status,
                    'request_id' => $request->header('X-Request-ID') ?? (string) \Illuminate\Support\Str::uuid(),
                ], $status);
            }
        });
    })->create();
