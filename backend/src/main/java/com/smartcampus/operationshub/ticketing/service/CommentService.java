package com.smartcampus.operationshub.ticketing.service;

import com.smartcampus.operationshub.ticketing.dto.CommentRequestDTO;
import com.smartcampus.operationshub.ticketing.dto.CommentResponseDTO;

import java.util.List;

/**
 * Service interface for Comment operations.
 */
public interface CommentService {
    
    /**
     * Add a comment to a ticket.
     */
    CommentResponseDTO addComment(Long ticketId, Long userId, CommentRequestDTO request);
    
    /**
     * Get all comments for a specific ticket.
     */
    List<CommentResponseDTO> getCommentsByTicketId(Long ticketId);
    
    /**
     * Update an existing comment. 
     * Ownership rule: Only the creator can edit.
     */
    CommentResponseDTO updateComment(Long commentId, Long userId, CommentRequestDTO request);
    
    /**
     * Delete a comment.
     * Ownership rule: Only the creator can delete.
     */
    void deleteComment(Long commentId, Long userId);
}
