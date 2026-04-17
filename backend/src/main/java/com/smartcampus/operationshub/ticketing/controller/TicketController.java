package com.smartcampus.operationshub.ticketing.controller;

import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.ticketing.dto.TicketRequestDTO;
import com.smartcampus.operationshub.ticketing.dto.TicketResponseDTO;
import com.smartcampus.operationshub.ticketing.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Managing Tickets.
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    /**
     * POST: Create a new ticket.
     */
    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody TicketRequestDTO request,
            @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(ticketService.createTicket(request, user.getId()), HttpStatus.CREATED);
    }

    /**
     * GET: Retrieve all tickets.
     */
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    /**
     * GET: Retrieve a ticket by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    /**
     * PUT: Update an existing ticket.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequestDTO request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    /**
     * DELETE: Delete a ticket.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET: Retrieve tickets created by the current authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.getTicketsByCreator(user.getId()));
    }

    /**
     * GET: Retrieve tickets assigned to the current authenticated user.
     */
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponseDTO>> getAssignedTickets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.getTicketsByAssignee(user.getId()));
    }
}
