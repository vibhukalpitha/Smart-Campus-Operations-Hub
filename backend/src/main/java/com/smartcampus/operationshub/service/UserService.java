package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.ProfileUpdateRequest;
import com.smartcampus.operationshub.dto.UserDto;
import com.smartcampus.operationshub.entity.Role;
import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto updateUserRole(Long id, Role newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        return mapToDto(userRepository.save(user));
    }

    public UserDto updateMyProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        boolean mfaChanged = false;
        if (request.getMfaEnabled() != null && !request.getMfaEnabled().equals(user.getMfaEnabled())) {
            mfaChanged = true;
            user.setMfaEnabled(request.getMfaEnabled());
        }

        userRepository.save(user);

        // Notify user via email
        emailService.sendProfileUpdatedEmail(user.getEmail());

        String alertMessage = "Your account profile details were recently updated.";
        if (mfaChanged) {
            alertMessage = request.getMfaEnabled() ? "2-Step Verification has been successfully enabled." : "2-Step Verification has been disabled.";
        }
        
        // Broadcast WebSocket Real-Time Notification
        notificationService.createNotification(
                user.getId(),
                "Security Update",
                alertMessage
        );

        return mapToDto(user);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
