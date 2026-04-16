package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.entity.Notification;
import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.repository.NotificationRepository;
import com.smartcampus.operationshub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<Notification> getNotificationsForUser(String email) {
        return notificationRepository.findByUserEmailOrPublic(email);
    }

    public Notification createNotification(String title, String message, String type, String userEmail) {
        User user = null;
        if (userEmail != null && !userEmail.isEmpty()) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .user(user)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Broadcast to specific user or to public topic
        if (user != null) {
            messagingTemplate.convertAndSend("/topic/notifications/" + user.getEmail(), saved);
        } else {
            messagingTemplate.convertAndSend("/topic/notifications", saved);
        }

        return saved;
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
