package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.dto.BookingRequest;
import com.smartcampus.operationshub.dto.BookingResponse;
import com.smartcampus.operationshub.entity.BookingStatus;
import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    // POST: Create a new booking request
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request,
            @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(bookingService.createBooking(request, user), HttpStatus.CREATED);
    }

    // GET: Retrieve bookings (Admin sees all, User sees their own)
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getBookings(@AuthenticationPrincipal User user) {
        if (user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.ok(bookingService.getAllBookings());
        }
        return ResponseEntity.ok(bookingService.getMyBookings(user));
    }

    // PUT: Admin review (Approve/Reject)
    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        BookingStatus status = BookingStatus.valueOf(payload.get("status"));
        String reason = payload.get("reason");
        return ResponseEntity.ok(bookingService.updateStatus(id, status, reason));
    }

    // DELETE: User cancels their own booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        bookingService.cancelBooking(id, user);
        return ResponseEntity.noContent().build();
    }

    // GET: Events for Calendar
    @GetMapping("/events")
    public ResponseEntity<List<Map<String, Object>>> getCalendarEvents(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getBookingsForCalendar(user));
    }

    // GET: Future Lecturer Sessions for a Resource
    @GetMapping("/resource/{resourceId}/sessions")
    public ResponseEntity<List<BookingResponse>> getLecturerSessions(@PathVariable Long resourceId) {
        return ResponseEntity.ok(bookingService.getLecturerSessions(resourceId));
    }

    // GET: All active Future Lecturer Sessions
    @GetMapping("/sessions/active")
    public ResponseEntity<List<BookingResponse>> getAllLecturerSessions() {
        return ResponseEntity.ok(bookingService.getAllLecturerSessions());
    }

    // GET: Occupied slots for all resources on a specific date
    @GetMapping("/occupied")
    public ResponseEntity<List<Map<String, Object>>> getOccupiedSlots(
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(bookingService.getOccupiedSlots(date));
    }
}
