package com.smartcampus.operationshub.ticketing.service;

import com.smartcampus.operationshub.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.ticketing.dto.CommentRequestDTO;
import com.smartcampus.operationshub.ticketing.dto.CommentResponseDTO;
import com.smartcampus.operationshub.ticketing.entity.Comment;
import com.smartcampus.operationshub.ticketing.repository.CommentRepository;
import com.smartcampus.operationshub.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of CommentService.
 */
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;

    @Override
    @Transactional
    public CommentResponseDTO addComment(Long ticketId, Long userId, CommentRequestDTO request) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + ticketId);
        }

        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .userId(userId)
                .content(request.getContent())
                .build();

        return mapToResponse(commentRepository.save(comment));
    }

    @Override
    public List<CommentResponseDTO> getCommentsByTicketId(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + ticketId);
        }
        return commentRepository.findByTicketId(ticketId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommentResponseDTO updateComment(Long commentId, Long userId, CommentRequestDTO request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        // Ownership rule: Only the creator can edit
        if (!comment.getUserId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to edit this comment");
        }

        comment.setContent(request.getContent());
        return mapToResponse(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        // Ownership rule: Only the creator can delete
        if (!comment.getUserId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private CommentResponseDTO mapToResponse(Comment comment) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .ticketId(comment.getTicketId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
