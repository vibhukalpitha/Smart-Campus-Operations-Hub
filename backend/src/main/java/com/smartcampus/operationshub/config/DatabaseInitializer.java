package com.smartcampus.operationshub.config;

import com.smartcampus.operationshub.entity.Role;
import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DatabaseInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            java.util.Optional<User> optionalUser = userRepository.findByEmail("kalpithawanigasinhe@gmail.com");
            if (optionalUser.isPresent()) {
                User admin = optionalUser.get();
                admin.setRole(Role.ADMIN);
                admin.setEmailVerified(true);
                userRepository.save(admin);
                System.out.println("Existing user kalpithawanigasinhe@gmail.com promoted to Admin");
            } else {
                User admin = User.builder()
                        .firstName("Kalpitha")
                        .lastName("Wanigasinhe")
                        .email("kalpithawanigasinhe@gmail.com")
                        .password(passwordEncoder.encode("12345678"))
                        .role(Role.ADMIN)
                        .emailVerified(true)
                        .build();
                userRepository.save(admin);
                System.out.println("Default Admin Account Created: kalpithawanigasinhe@gmail.com / 12345678");
            }
            
            java.util.Optional<User> sliitUser = userRepository.findByEmail("it23426658@my.sliit.lk");
            if (sliitUser.isPresent()) {
                User admin = sliitUser.get();
                admin.setRole(Role.ADMIN);
                admin.setEmailVerified(true);
                userRepository.save(admin);
                System.out.println("Existing SLIIT user promoted to Admin");
            }
        };
    }
}
