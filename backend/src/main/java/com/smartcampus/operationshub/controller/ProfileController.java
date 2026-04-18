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

    @PostMapping("/picture")
    public ResponseEntity<UserDto> uploadProfilePicture(@RequestParam("file") org.springframework.web.multipart.MultipartFile file, Authentication authentication) {
        try {
            return ResponseEntity.ok(userService.uploadProfilePicture(authentication.getName(), file));
        } catch (java.io.IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}
