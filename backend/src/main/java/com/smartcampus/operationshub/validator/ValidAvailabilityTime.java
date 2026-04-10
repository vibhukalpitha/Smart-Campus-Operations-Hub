package com.smartcampus.operationshub.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AvailabilityTimeValidator.class)
@Documented
public @interface ValidAvailabilityTime {
    String message() default "availableTo must be after availableFrom";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
