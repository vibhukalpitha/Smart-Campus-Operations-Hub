package com.smartcampus.operationshub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OperationsHubApplication {

	public static void main(String[] args) {
		SpringApplication.run(OperationsHubApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner alterRoleColumnDefinition(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role ENUM('USER', 'ADMIN', 'TECHNICIAN', 'LECTURER')");
				System.out.println("Modified role column to include LECTURER.");
			} catch (Exception e) {
				System.err.println("Could not alter table: " + e.getMessage());
			}
		};
	}
}
