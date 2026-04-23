package com.smartcampus.operationshub.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String token) {
        String subject = "Verify your Smart Campus Hub Account";
        String link = "http://localhost:5173/verify-email?token=" + token;
        System.out.println("====== SYSTEM MAIL INTERCEPT ======");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Verification Link: " + link);
        System.out.println("===================================");
        
        sendSafeMail(to, subject, "Please click this link to verify your account:\n\n" + link);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Smart Campus Hub - Password Reset";
        String link = "http://localhost:5173/reset-password?token=" + token;
        System.out.println("====== SYSTEM MAIL INTERCEPT ======");
        System.out.println("To: " + to);
        System.out.println("Password Reset Link: " + link);
        System.out.println("===================================");

        sendSafeMail(to, subject, "Please click this link to reset your password:\n\n" + link);
    }

    public void sendMfaCodeEmail(String to, String code) {
        String subject = "Your 2FA Login Code";
        System.out.println("====== SYSTEM MAIL INTERCEPT ======");
        System.out.println("To: " + to);
        System.out.println("2FA Code: " + code);
        System.out.println("===================================");

        sendSafeMail(to, subject, "Your 6-digit login code is: " + code);
    }

    public void sendProfileUpdatedEmail(String to) {
        String subject = "Profile Information Updated";
        sendSafeMail(to, subject, "Hello, your Smart Campus Hub profile details or password were just updated.");
    }

    public void sendContactEmail(String fromEmail, String name, String message) {
        String subject = "EduNexus Contact Form: Message from " + name;
        String body = "Name: " + name + "\nEmail: " + fromEmail + "\n\nMessage:\n" + message;
        // Sending to support email
        sendSafeMail("kalpithawanigasinhe@gmail.com", subject, body);
    }

    private void sendSafeMail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("kalpithawanigasinhe@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            // Fails silently if Mailtrap credentials are fake, but outputs the stack briefly
            System.err.println("SMTP Mail not sent (mock config?). Details: " + e.getMessage());
        }
    }
}
