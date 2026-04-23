package com.smartcampus.operationshub.dto;

import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceDTO {

    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private ResourceStatus status;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private LocalDateTime createdAt;
    private Integer bookedCount;
    private Integer availableSeats;

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

