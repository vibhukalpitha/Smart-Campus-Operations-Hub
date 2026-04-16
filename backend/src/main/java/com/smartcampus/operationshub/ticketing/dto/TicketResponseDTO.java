package com.smartcampus.operationshub.ticketing.dto;

import com.smartcampus.operationshub.ticketing.constant.Priority;
import com.smartcampus.operationshub.ticketing.constant.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for returning Ticket data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponseDTO {
    private Long id;
    private String description;
    private String category;
    private Priority priority;
    private TicketStatus status;
    private Long createdBy;
    private Long assignedTo;
    private String contactDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
