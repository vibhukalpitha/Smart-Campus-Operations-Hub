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
import org.springframework.web.multipart.MultipartFile;

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
    private final FileStorageService fileStorageService;

    public AuthResponse register(RegisterRequest request, MultipartFile profilePicture) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        String vToken = UUID.randomUUID().toString();

        String profilePicPath = null;
        try {
            profilePicPath = fileStorageService.saveProfilePicture(profilePicture);
        } catch (Exception e) {
            System.err.println("Failed to save profile picture: " + e.getMessage());
        }

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // default to USER. Can be changed by DB/admin
                .emailVerified(true)
                .verificationToken(vToken)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .profilePicture(profilePicPath)
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
                .id(user.getId())
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
                .id(user.getId())
                .token(jwtToken)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }

    @org.springframework.beans.factory.annotation.Value("${github.client.id:}")
    private String githubClientId;

    @org.springframework.beans.factory.annotation.Value("${github.client.secret:}")
    private String githubClientSecret;

    public AuthResponse githubLogin(String code) {
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        headers.setAccept(java.util.List.of(org.springframework.http.MediaType.APPLICATION_JSON));
        java.util.Map<String, String> params = new java.util.HashMap<>();
        params.put("client_id", githubClientId);
        params.put("client_secret", githubClientSecret);
        params.put("code", code);
        
        org.springframework.http.HttpEntity<java.util.Map<String, String>> request = new org.springframework.http.HttpEntity<>(params, headers);
        org.springframework.http.ResponseEntity<java.util.Map> response;
        try {
            response = restTemplate.postForEntity("https://github.com/login/oauth/access_token", request, java.util.Map.class);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            throw new RuntimeException("GitHub oauth token error: " + e.getResponseBodyAsString());
        }
        
        String accessToken = (String) response.getBody().get("access_token");
        if (accessToken == null) {
            throw new RuntimeException("Failed to get access token from GitHub. Body returned: " + response.getBody());
        }
        
        org.springframework.http.HttpHeaders userHeaders = new org.springframework.http.HttpHeaders();
        userHeaders.setBearerAuth(accessToken);
        org.springframework.http.HttpEntity<String> userRequest = new org.springframework.http.HttpEntity<>(userHeaders);
        
        org.springframework.http.ResponseEntity<java.util.Map> userResponse;
        try {
            userResponse = restTemplate.exchange("https://api.github.com/user", org.springframework.http.HttpMethod.GET, userRequest, java.util.Map.class);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            throw new RuntimeException("GitHub user profile fetch error: " + e.getResponseBodyAsString());
        }
        
        java.util.Map<String, Object> userData = userResponse.getBody();
        String login = (String) userData.get("login");
        String name = (String) userData.get("name");
        String avatarUrl = (String) userData.get("avatar_url");
        
        org.springframework.http.ResponseEntity<java.util.List> emailResponse = restTemplate.exchange("https://api.github.com/user/emails", org.springframework.http.HttpMethod.GET, userRequest, java.util.List.class);
        String email = null;
        for (Object item : emailResponse.getBody()) {
            java.util.Map eInfo = (java.util.Map) item;
            if (Boolean.TRUE.equals(eInfo.get("primary")) && Boolean.TRUE.equals(eInfo.get("verified"))) {
                email = (String) eInfo.get("email");
                break;
            }
        }
        if (email == null) email = login + "@github.user.local";
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                .firstName(name != null ? name.split(" ")[0] : login)
                .lastName(name != null && name.split(" ").length > 1 ? name.substring(name.indexOf(" ") + 1) : "GithubUser")
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(Role.USER)
                .emailVerified(true)
                .profilePicture(avatarUrl)
                .build();
            userRepository.save(user);
        }
        
        String jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .id(user.getId())
                .token(jwtToken)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .profilePicture(user.getProfilePicture())
                .build();
    }

    @org.springframework.beans.factory.annotation.Value("${google.client.id:}")
    private String googleClientId;

    @org.springframework.beans.factory.annotation.Value("${google.client.secret:}")
    private String googleClientSecret;

    @org.springframework.beans.factory.annotation.Value("${google.redirect.uri:}")
    private String googleRedirectUri;

    public AuthResponse googleLogin(String code) {
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);
        
        org.springframework.util.MultiValueMap<String, String> map = new org.springframework.util.LinkedMultiValueMap<>();
        map.add("client_id", googleClientId);
        map.add("client_secret", googleClientSecret);
        map.add("code", code);
        map.add("grant_type", "authorization_code");
        map.add("redirect_uri", googleRedirectUri);
        
        org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, String>> request = new org.springframework.http.HttpEntity<>(map, headers);
        
        org.springframework.http.ResponseEntity<java.util.Map> response;
        try {
            response = restTemplate.postForEntity("https://oauth2.googleapis.com/token", request, java.util.Map.class);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            throw new RuntimeException("Google oauth token error: " + e.getResponseBodyAsString());
        }
        
        String accessToken = (String) response.getBody().get("access_token");
        if (accessToken == null) {
            throw new RuntimeException("Failed to get access token from Google.");
        }
        
        org.springframework.http.HttpHeaders userHeaders = new org.springframework.http.HttpHeaders();
        userHeaders.setBearerAuth(accessToken);
        org.springframework.http.HttpEntity<String> userRequest = new org.springframework.http.HttpEntity<>(userHeaders);
        
        org.springframework.http.ResponseEntity<java.util.Map> userResponse;
        try {
            userResponse = restTemplate.exchange("https://www.googleapis.com/oauth2/v3/userinfo", org.springframework.http.HttpMethod.GET, userRequest, java.util.Map.class);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            throw new RuntimeException("Google user profile fetch error: " + e.getResponseBodyAsString());
        }
        
        java.util.Map<String, Object> userData = userResponse.getBody();
        String stringEmail = (String) userData.get("email");
        String name = (String) userData.get("name");
        String givenName = (String) userData.get("given_name");
        String familyName = (String) userData.get("family_name");
        String avatarUrl = (String) userData.get("picture");
        
        if (stringEmail == null) {
            throw new RuntimeException("Email not provided by Google.");
        }
        
        if (givenName == null && name != null) {
             givenName = name.split(" ")[0];
             familyName = name.split(" ").length > 1 ? name.substring(name.indexOf(" ") + 1) : "";
        } else if (givenName == null) {
             givenName = "GoogleUser";
             familyName = "";
        }
        
        User user = userRepository.findByEmail(stringEmail).orElse(null);
        if (user == null) {
            user = User.builder()
                .firstName(givenName)
                .lastName(familyName)
                .email(stringEmail)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(Role.USER)
                .emailVerified(true)
                .profilePicture(avatarUrl)
                .build();
            userRepository.save(user);
        }
        
        String jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .id(user.getId())
                .token(jwtToken)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .profilePicture(user.getProfilePicture())
                .build();
    }
}

