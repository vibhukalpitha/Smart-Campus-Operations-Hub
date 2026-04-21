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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.smartcampus.operationshub.exception.BookingConflictException;

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

        // Smart Conflict Checking for Room Bookings (LECTURER/ADMIN)
        if (user.getRole().name().equals("LECTURER") || user.getRole().name().equals("ADMIN")) {
            List<Booking> overlappingRoomBookings = bookingRepository.findOverlappingBookings(
                    request.getResourceId(),
                    request.getStartTime().minusMinutes(10),
                    request.getEndTime().plusMinutes(10)
            ).stream()
            .filter(b -> b.getUser().getRole().name().equals("LECTURER") || b.getUser().getRole().name().equals("ADMIN"))
            .collect(Collectors.toList());

            boolean hasConflict = overlappingRoomBookings.stream().anyMatch(b -> 
                request.getStartTime().isBefore(b.getEndTime().plusMinutes(10)) && 
                request.getEndTime().isAfter(b.getStartTime().minusMinutes(10))
            );

            if (hasConflict) {
                List<String> suggestions = findSuggestions(request.getResourceId(), request.getStartTime(), request.getEndTime());
                throw new BookingConflictException(
                    "Scheduling conflict (including 10 min buffer): This resource is already booked by another lecturer for this time.", 
                    suggestions
                );
            }
        }

        // Logic for Students (USER) - Seat Booking
        if (user.getRole().name().equals("USER")) {
            // Students skip the buffer check and only join existing lecturer sessions
            List<Booking> dayBookings = bookingRepository.findOverlappingBookings(
                    request.getResourceId(),
                    request.getStartTime().withHour(0).withMinute(0),
                    request.getStartTime().withHour(23).withMinute(59)
            );

            // Must fit INSIDE an existing Lecturer session
            boolean hasLecturerSession = dayBookings.stream()
                    .filter(b -> b.getUser().getRole().name().equals("LECTURER") && b.getStatus() == BookingStatus.APPROVED)
                    .anyMatch(b -> !request.getStartTime().isBefore(b.getStartTime()) && !request.getEndTime().isAfter(b.getEndTime()));

            if (!hasLecturerSession) {
                throw new RuntimeException("Students can only book seats during existing scheduled Lecturer sessions.");
            }

            // Calculate used seats in this specific time window
            int usedSeats = dayBookings.stream()
                    .filter(b -> b.getUser().getRole().name().equals("USER") && 
                                 (b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.PENDING))
                    .filter(b -> request.getStartTime().isBefore(b.getEndTime()) && request.getEndTime().isAfter(b.getStartTime()))
                    .mapToInt(Booking::getExpectedAttendees)
                    .sum();

            if (usedSeats + request.getExpectedAttendees() > resource.getCapacity()) {
                throw new RuntimeException("Not enough seats available in this lecture session. Only " + (resource.getCapacity() - usedSeats) + " seats left.");
            }
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

    public List<BookingResponse> getLecturerSessions(Long resourceId) {
        return bookingRepository.findFutureLecturerBookings(resourceId)
                .stream()
                .map(this::mapLecturerSessionToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllLecturerSessions() {
        return bookingRepository.findAllFutureLecturerBookings()
                .stream()
                .map(this::mapLecturerSessionToResponse)
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
                .resourceType(booking.getResource().getType())
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

    private BookingResponse mapLecturerSessionToResponse(Booking booking) {
        BookingResponse response = mapToResponse(booking);
        List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                booking.getResource().getId(),
                booking.getStartTime(),
                booking.getEndTime()
        );
        int usedSeats = overlaps.stream()
                .filter(b -> b.getUser().getRole().name().equals("USER") && 
                             (b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.PENDING))
                .mapToInt(Booking::getExpectedAttendees)
                .sum();
                
        response.setBookedSeats(usedSeats);
        response.setAvailableSeats(booking.getExpectedAttendees() - usedSeats);
        return response;
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

    public List<java.util.Map<String, Object>> getOccupiedSlots(String dateStr, Integer days) {
        LocalDateTime start;
        LocalDateTime end;
        
        int daysToFetch = (days != null) ? days : 1;

        if (dateStr != null) {
            java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
            start = date.atStartOfDay();
            end = date.plusDays(daysToFetch - 1).atTime(23, 59, 59);
        } else {
            start = LocalDateTime.now().withHour(0).withMinute(0);
            end = LocalDateTime.now().plusDays(daysToFetch - 1).withHour(23).withMinute(59);
        }

        return bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.PENDING)
                .filter(b -> (b.getStartTime().isBefore(end) && b.getEndTime().isAfter(start)))
                .map(b -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("resourceId", b.getResource().getId());
                    map.put("startTime", b.getStartTime());
                    map.put("endTime", b.getEndTime());
                    map.put("dayOfWeek", b.getStartTime().getDayOfWeek().name());
                    map.put("userEmail", b.getUser().getEmail());
                    return map;
                })
                .collect(Collectors.toList());
    }

    private List<String> findSuggestions(Long resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        LocalDateTime dayStart = startTime.withHour(8).withMinute(0).withSecond(0);
        LocalDateTime dayEnd = startTime.withHour(20).withMinute(0).withSecond(0);
        
        long durationMinutes = java.time.Duration.between(startTime, endTime).toMinutes();
        if (durationMinutes <= 0) durationMinutes = 60; // Default 1 hour if error

        List<Booking> dayBookings = bookingRepository.findOverlappingBookings(
                resourceId, dayStart.minusMinutes(10), dayEnd.plusMinutes(10)
        );

        List<String> suggestions = new ArrayList<>();
        LocalDateTime current = dayStart;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        while (current.plusMinutes(durationMinutes).isBefore(dayEnd.plusSeconds(1))) {
            LocalDateTime potentialStart = current;
            LocalDateTime potentialEnd = current.plusMinutes(durationMinutes);
            
            boolean conflict = false;
            for (Booking b : dayBookings) {
                if (potentialStart.isBefore(b.getEndTime().plusMinutes(10)) && 
                    potentialEnd.isAfter(b.getStartTime().minusMinutes(10))) {
                    conflict = true;
                    current = b.getEndTime().plusMinutes(10);
                    break;
                }
            }
            
            if (!conflict) {
                // Check if this slot is already what they tried
                if (!(potentialStart.equals(startTime))) {
                    suggestions.add(potentialStart.format(formatter) + " - " + potentialEnd.format(formatter));
                    if (suggestions.size() >= 3) break;
                }
                current = current.plusMinutes(30);
            }
        }
        
        return suggestions;
    }
}
