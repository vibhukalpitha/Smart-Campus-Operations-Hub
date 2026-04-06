package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.dto.ProfileUpdateRequest;
import com.smartcampus.operationshub.dto.UserDto;
import com.smartcampus.operationshub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfileController {

    private final UserService userService;

    @PutMapping
    public ResponseEntity<UserDto> updateProfile(@RequestBody ProfileUpdateRequest request, Authentication authentication) {
        String currentUserEmail = authentication.getName(); // Spring Security puts the email in principal name
        return ResponseEntity.ok(userService.updateMyProfile(currentUserEmail, request));
    }
}
