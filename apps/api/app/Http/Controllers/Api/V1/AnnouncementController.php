<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnnouncementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    protected $announcementService;

    public function __construct(AnnouncementService $announcementService)
    {
        $this->announcementService = $announcementService;
    }

    /**
     * Store a new announcement (Principal/Office only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'audience' => 'required|in:all,teacher,student,parent',
            'publish_at' => 'nullable|date',
        ]);

        $announcement = $this->announcementService->createAnnouncement($request->all(), Auth::id());

        return response()->json($announcement, 201);
    }

    /**
     * List announcements for the current user.
     */
    public function index()
    {
        $user = Auth::user();
        $announcements = $this->announcementService->getAnnouncementsForUser($user->id, $user->role);

        return response()->json($announcements);
    }

    /**
     * Show an announcement and mark as read.
     */
    public function show($id)
    {
        $user = Auth::user();
        $this->announcementService->markAsRead($id, $user->id);

        $announcement = \App\Models\Announcement::findOrFail($id);

        // Authorization check (can the user see this audience?)
        if ($announcement->audience !== 'all' && $announcement->audience !== $user->role && $user->role !== 'principal' && $user->role !== 'office') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json($announcement);
    }
}
