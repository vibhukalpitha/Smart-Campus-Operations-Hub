package com.smartcampus.operationshub.ticketing.dto;

import com.smartcampus.operationshub.ticketing.constant.Priority;
import com.smartcampus.operationshub.ticketing.constant.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating a Ticket.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequestDTO {

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private TicketStatus status;

    private Long assignedTo;

    private Long resourceId;

    private String location;

    private String contactDetails;
}
