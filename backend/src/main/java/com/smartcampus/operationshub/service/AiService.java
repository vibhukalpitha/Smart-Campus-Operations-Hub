package com.smartcampus.operationshub.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_PROMPT = 
        "You are the 'Smart Campus Operations Hub Assistant', a helpful and professional AI guide for the Smart Campus platform. " +
        "Your goal is to help users navigate the system and understand its functionalities. " +
        "\n\nSITE FUNCTIONALITIES:" +
        "\n1. Authentication: Users can login via Email, GitHub, or Google. 2FA is supported." +
        "\n2. Resource Management: Users can view campus labs, halls, and equipment. They can see availability and capacity." +
        "\n3. Booking System: Lecturers can book entire resources for sessions. Students can join these sessions to book specific seats." +
        "\n4. Ticketing (Service Hub): Users can report campus issues (maintenance, IT) and track status." +
        "\n5. Community: A directory of campus staff (Admins, Lecturers, Technicians)." +
        "\n6. Profile: Users can update details and set security preferences." +
        "\n\nGUIDELINES:" +
        "\n- Be concise and professional." +
        "\n- If a user asks a question unrelated to the campus or the system, politely steer them back." +
        "\n- Use formatting like bullet points for clarity." +
        "\n- Always emphasize that you are an assistant for THIS specific platform.";

    public String getChatResponse(String userMessage) {
        if (apiKey == null || apiKey.equals("YOUR_GPT_API_KEY") || apiKey.isEmpty()) {
            return "I'm currently in offline mode (API key not configured). I can help you with manual instructions: You can book resources in the 'Resource Hub', report issues in the 'Service Hub', or find staff in the 'Community' section.";
        }

        try {
            String url = apiUrl;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
            messages.add(Map.of("role", "user", "content", userMessage));

            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                List choices = (List) response.getBody().get("choices");
                Map choice = (Map) choices.get(0);
                Map message = (Map) choice.get("message");
                return (String) message.get("content");
            } else {
                System.err.println("OpenAI Error: " + response.getStatusCode() + " - " + response.getBody());
            }

            return "I encountered an error connecting to my AI core. Status: " + response.getStatusCode();
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("OpenAI Client Error: " + e.getResponseBodyAsString());
            return "AI Error: " + e.getResponseBodyAsString();
        } catch (Exception e) {
            e.printStackTrace();
            return "My AI services are currently unavailable. Error: " + e.getMessage();
        }
    }
}
