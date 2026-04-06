package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.NotificationDTO;
import com.smartcampus.operationshub.entity.Notification;
import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.repository.NotificationRepository;
import com.smartcampus.operationshub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<NotificationDTO> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public NotificationDTO createNotification(Long userId, String title, String message) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .build();
        
        NotificationDTO dto = mapToDTO(notificationRepository.save(notification));
        
        // Broadcast over WebSockets
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getEmail(), dto);
        
        return dto;
    }

    public NotificationDTO markAsRead(Long notificationId, String email) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to update this notification");
        }
        
        notification.setRead(true);
        return mapToDTO(notificationRepository.save(notification));
    }

    public void deleteNotification(Long notificationId, String email) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getEmail().equals(email)) {
             throw new RuntimeException("Unauthorized to delete this notification");
        }
        
        notificationRepository.delete(notification);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
