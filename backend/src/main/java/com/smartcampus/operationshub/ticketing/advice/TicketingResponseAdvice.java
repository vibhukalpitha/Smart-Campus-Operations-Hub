package com.smartcampus.operationshub.ticketing.advice;

import com.smartcampus.operationshub.ticketing.dto.TicketingResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * Advice to automatically wrap all responses from the ticketing package into a TicketingResponse.
 */
@RestControllerAdvice(basePackages = "com.smartcampus.operationshub.ticketing")
public class TicketingResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Apply to all methods in the ticketing package
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {

        // Avoid double wrapping if already a TicketingResponse
        if (body instanceof TicketingResponse) {
            return body;
        }

        // Handle string responses differently if needed, but for REST APIs DTOs are common
        // If body is null, we still wrap it to indicate success with no data
        return TicketingResponse.success(body);
    }
}
