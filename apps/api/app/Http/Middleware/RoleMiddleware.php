<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|array  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Handle both ['role1', 'role2'] and ['role1,role2']
        $flatRoles = [];
        foreach ($roles as $role) {
            if (str_contains($role, ',')) {
                $flatRoles = array_merge($flatRoles, explode(',', $role));
            } else {
                $flatRoles[] = $role;
            }
        }

        if (!in_array($request->user()->role, $flatRoles)) {
            return response()->json([
                'message' => 'Forbidden: You do not have the required role.',
                'required_roles' => $flatRoles,
                'your_role' => $request->user()->role
            ], 403);
        }



        return $next($request);
    }
}
