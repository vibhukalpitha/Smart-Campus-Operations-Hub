package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.dto.RoleUpdateRequest;
import com.smartcampus.operationshub.dto.UserDto;
import com.smartcampus.operationshub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Or configure centrally
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable("id") Long id, @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(id, request.getRole()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/picture")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> uploadProfilePicture(@PathVariable("id") Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            return ResponseEntity.ok(userService.uploadProfilePictureById(id, file));
        } catch (java.io.IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}
