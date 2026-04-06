package com.smartcampus.operationshub.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String password; // optional
    private Boolean mfaEnabled;
}
