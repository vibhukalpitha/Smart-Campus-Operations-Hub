package com.smartcampus.operationshub.ticketing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for adding or updating a Comment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequestDTO {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;
}
