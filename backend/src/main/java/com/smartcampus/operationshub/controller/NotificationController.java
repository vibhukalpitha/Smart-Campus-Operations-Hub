package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.entity.Notification;
import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getAll(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user.getEmail()));
    }

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Map<String, String> payload) {
        // Typically only admins should call this to broadcast
        return ResponseEntity.ok(notificationService.createNotification(
                payload.get("title"),
                payload.get("message"),
                payload.get("type"),
                payload.get("userEmail")
        ));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}
