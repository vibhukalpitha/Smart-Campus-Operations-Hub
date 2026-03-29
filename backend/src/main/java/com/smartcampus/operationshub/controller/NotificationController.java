package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.dto.NotificationCreateRequest;
import com.smartcampus.operationshub.dto.NotificationDTO;
import com.smartcampus.operationshub.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUserNotifications(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@Valid @RequestBody NotificationCreateRequest request) {
        return ResponseEntity.ok(notificationService.createNotification(
                request.getUserId(), request.getTitle(), request.getMessage()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(notificationService.markAsRead(id, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Authentication authentication) {
        notificationService.deleteNotification(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
