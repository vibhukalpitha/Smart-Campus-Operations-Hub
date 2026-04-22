package com.smartcampus.operationshub.dto;

import com.smartcampus.operationshub.entity.BookingStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private com.smartcampus.operationshub.entity.ResourceType resourceType;
    private Long userId;
    private String userEmail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    
    // Additional computed fields for Lecturer Sessions
    private Integer bookedSeats;
    private Integer availableSeats;
    private java.util.List<String> suggestedSlots;
}
