package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.AuthResponse;
import com.smartcampus.operationshub.dto.LoginRequest;
import com.smartcampus.operationshub.dto.RegisterRequest;
import com.smartcampus.operationshub.entity.Role;
import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.repository.UserRepository;
import com.smartcampus.operationshub.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        String vToken = UUID.randomUUID().toString();

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // default to USER. Can be changed by DB/admin
                .emailVerified(false)
                .verificationToken(vToken)
                .build();

        userRepository.save(user);

        // Send Email Intercept
        emailService.sendVerificationEmail(user.getEmail(), vToken);

        return AuthResponse.builder()
                .message("Registration successful. Please check your email to verify your account.")
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email not verified! Check your inbox.");
        }

        if (Boolean.TRUE.equals(user.getMfaEnabled())) {
            String code = String.format("%06d", ThreadLocalRandom.current().nextInt(100000, 999999));
            user.setMfaCode(code);
            userRepository.save(user);
            emailService.sendMfaCodeEmail(user.getEmail(), code);
            
            return AuthResponse.builder()
                    .requiresTwoFactor(true)
                    .email(user.getEmail())
                    .message("2FA Code sent to email.")
                    .build();
        }

        var jwtToken = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }

    public void verifyEmail(String token) {
        User user = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getVerificationToken()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        }
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getResetToken()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        userRepository.save(user);
    }

    public AuthResponse verify2FA(String email, String code) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.getMfaEnabled()) || !code.equals(user.getMfaCode())) {
            throw new RuntimeException("Invalid or expired 2FA code.");
        }

        // Clear code after successful use
        user.setMfaCode(null);
        userRepository.save(user);

        var jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }
}

