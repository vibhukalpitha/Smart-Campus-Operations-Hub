package com.smartcampus.operationshub.ticketing.advice;

import com.smartcampus.operationshub.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.ticketing.dto.TicketingResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Hub-localized exception handler for the ticketing module.
 * Provides specialized handling and logging for module-specific errors.
 */
@RestControllerAdvice(basePackages = "com.smartcampus.operationshub.ticketing")
@Slf4j
public class TicketingExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<TicketingResponse<Map<String, String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.error("Validation error in ticketing module: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        TicketingResponse<Map<String, String>> response = new TicketingResponse<>(false, errors, "Validation failed", null);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<TicketingResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.error("Resource not found in ticketing module: {}", ex.getMessage());
        return new ResponseEntity<>(TicketingResponse.error(ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<TicketingResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Unauthorized access attempt in ticketing module: {}", ex.getMessage());
        return new ResponseEntity<>(TicketingResponse.error("You are not authorized to perform this action"), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<TicketingResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.error("Invalid argument in ticketing module: {}", ex.getMessage());
        return new ResponseEntity<>(TicketingResponse.error(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<TicketingResponse<Void>> handleGeneralException(Exception ex) {
        log.error("Unexpected error in ticketing module", ex);
        return new ResponseEntity<>(TicketingResponse.error("An unexpected error occurred: " + ex.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
