package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.BookingRequest;
import com.smartcampus.operationshub.dto.BookingResponse;
import com.smartcampus.operationshub.entity.Booking;
import com.smartcampus.operationshub.entity.BookingStatus;
import com.smartcampus.operationshub.entity.Resource;
import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.repository.BookingRepository;
import com.smartcampus.operationshub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, User user) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book for past dates");
        }

        // Conflict Checking
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                request.getResourceId(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Scheduling conflict: This resource is already booked for the selected time range.");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        
        // Notify Admins
        try {
            notificationService.createNotification(
                    "New Booking Request",
                    "User " + user.getEmail() + " requested " + resource.getName(),
                    "BOOKING_REQUEST",
                    null // Broadcast to all
            );
        } catch (Exception e) {
            // Log error but don't fail the booking
            System.err.println("Failed to send broadcast notification: " + e.getMessage());
        }

        return mapToResponse(saved);
    }

    public List<BookingResponse> getMyBookings(User user) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse updateStatus(Long id, BookingStatus status, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);
        if (reason != null) {
            booking.setRejectionReason(reason);
        }

        Booking updated = bookingRepository.save(booking);

        // Notify User
        notificationService.createNotification(
                "Booking " + status,
                "Your booking for " + booking.getResource().getName() + " has been " + status,
                "BOOKING_UPDATE",
                booking.getUser().getEmail()
        );

        return mapToResponse(updated);
    }

    @Transactional
    public void cancelBooking(Long id, User user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .userId(booking.getUser().getId())
                .userEmail(booking.getUser().getEmail())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    public List<java.util.Map<String, Object>> getBookingsForCalendar(User user) {
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        List<Booking> allBookings = bookingRepository.findAll();
        
        List<java.util.Map<String, Object>> events = new java.util.ArrayList<>();
        for (Booking b : allBookings) {
            if (!isAdmin && !b.getUser().getId().equals(user.getId()) 
                && !(b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.PENDING)) {
                continue;
            }

            java.util.Map<String, Object> event = new java.util.HashMap<>();
            event.put("id", b.getId());
            event.put("start", b.getStartTime().toString());
            event.put("end", b.getEndTime().toString());

            if (isAdmin || b.getUser().getId().equals(user.getId())) {
                event.put("title", "Booking (" + b.getStatus() + ")");
                event.put("color", getColorForStatus(b.getStatus().name()));
                event.put("user_email", b.getUser().getEmail());
                event.put("status", b.getStatus().name());
                event.put("purpose", b.getPurpose());
                event.put("resource_name", b.getResource().getName());
            } else {
                event.put("title", "Booked");
                event.put("color", "gray");
                event.put("display", "block");
            }
            events.add(event);
        }
        return events;
    }

    private String getColorForStatus(String status) {
        switch (status) {
            case "APPROVED": return "green";
            case "PENDING": return "#eab308";
            case "REJECTED": return "red";
            case "CANCELLED": return "gray";
            default: return "blue";
        }
    }
}
