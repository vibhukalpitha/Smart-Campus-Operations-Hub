package com.smartcampus.operationshub.ticketing.controller;

import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.ticketing.dto.CommentRequestDTO;
import com.smartcampus.operationshub.ticketing.dto.CommentResponseDTO;
import com.smartcampus.operationshub.ticketing.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Ticket Comments.
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService commentService;

    /**
     * POST /api/tickets/{id}/comments: Add a comment to a ticket.
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CommentRequestDTO request) {
        return new ResponseEntity<>(commentService.addComment(id, user.getId(), request), HttpStatus.CREATED);
    }

    /**
     * GET /api/tickets/{id}/comments: Retrieve all comments for a ticket.
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentsByTicketId(id));
    }

    /**
     * PUT /api/comments/{id}: Update a comment.
     */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CommentRequestDTO request) {
        return ResponseEntity.ok(commentService.updateComment(commentId, user.getId(), request));
    }

    /**
     * DELETE /api/comments/{id}: Delete a comment.
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {
        commentService.deleteComment(commentId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
