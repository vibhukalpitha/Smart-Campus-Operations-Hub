package com.smartcampus.operationshub.exception;

import lombok.Getter;
import java.util.List;

@Getter
public class BookingConflictException extends RuntimeException {
    private final List<String> suggestions;

    public BookingConflictException(String message, List<String> suggestions) {
        super(message);
        this.suggestions = suggestions;
    }
}
