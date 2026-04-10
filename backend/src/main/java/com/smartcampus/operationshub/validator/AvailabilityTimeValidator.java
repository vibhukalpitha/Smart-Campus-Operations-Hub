package com.smartcampus.operationshub.validator;

import com.smartcampus.operationshub.dto.ResourceCreateRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalTime;

public class AvailabilityTimeValidator implements ConstraintValidator<ValidAvailabilityTime, ResourceCreateRequest> {

    @Override
    public void initialize(ValidAvailabilityTime constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(ResourceCreateRequest value, ConstraintValidatorContext context) {
        // If either time is null, skip validation (they are optional fields)
        if (value.getAvailableFrom() == null || value.getAvailableTo() == null) {
            return true;
        }

        // availableFrom must be strictly before availableTo
        return value.getAvailableFrom().isBefore(value.getAvailableTo());
    }
}
