package com.smartcampus.operationshub.ticketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard API Response wrapper for the Ticketing module.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketingResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private LocalDateTime timestamp;

    public static <T> TicketingResponse<T> success(T data) {
        return TicketingResponse.<T>builder()
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> TicketingResponse<T> error(String message) {
        return TicketingResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
