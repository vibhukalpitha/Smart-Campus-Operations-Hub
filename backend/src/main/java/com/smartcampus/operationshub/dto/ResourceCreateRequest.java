package com.smartcampus.operationshub.dto;

import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import com.smartcampus.operationshub.validator.ValidAvailabilityTime;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ValidAvailabilityTime(message = "availableTo must be after availableFrom")
public class ResourceCreateRequest {

    @NotBlank(message = "Resource name cannot be blank")
    private String name;

    @NotNull(message = "Resource type cannot be null")
    private ResourceType type;

    @NotNull(message = "Capacity cannot be null")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location cannot be blank")
    private String location;

    private ResourceStatus status;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    // ── Public Computers metadata ────────────────────────────────────────
    private String deviceBrand;
    private String processor;
    private String ramCapacity;
    private String networkAccess;

    // ── Cricket metadata ─────────────────────────────────────────────────
    private Integer bats;
    private Integer balls;
    private Integer stumps;

    // ── Badminton metadata ───────────────────────────────────────────────
    private Integer rackets;
    private Integer shuttlecocks;
}

