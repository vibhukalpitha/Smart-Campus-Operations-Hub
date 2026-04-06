package com.smartcampus.operationshub.dto;

import com.smartcampus.operationshub.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleUpdateRequest {
    private Role role;
}
