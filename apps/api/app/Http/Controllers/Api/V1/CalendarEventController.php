<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CalendarEventService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CalendarEventController extends Controller
{
    protected $calendarService;

    public function __construct(CalendarEventService $calendarService)
    {
        $this->calendarService = $calendarService;
    }

    /**
     * Store a new calendar event (Principal/Office only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'visibility' => 'required|in:all,teacher,student,parent',
        ]);

        $event = $this->calendarService->createEvent($request->all(), Auth::id());

        return response()->json($event, 201);
    }

    /**
     * List calendar events for the current user's role.
     */
    public function index(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $user = Auth::user();
        $events = $this->calendarService->getEvents(
            $request->query('from'),
            $request->query('to'),
            $user->role
        );

        return response()->json($events);
    }
}
