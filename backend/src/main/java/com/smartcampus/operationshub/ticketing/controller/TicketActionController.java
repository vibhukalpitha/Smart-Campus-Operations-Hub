package com.smartcampus.operationshub.ticketing.controller;

import com.smartcampus.operationshub.ticketing.constant.TicketStatus;
import com.smartcampus.operationshub.ticketing.dto.TicketResponseDTO;
import com.smartcampus.operationshub.ticketing.service.TicketActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for extended Ticket actions (Status Update, Technician Assignment).
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketActionController {

    private final TicketActionService ticketActionService;

    /**
     * PATCH /api/tickets/{id}/status: Update ticket status.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(ticketActionService.updateStatus(id, status));
    }

    /**
     * PATCH /api/tickets/{id}/assign: Assign a technician to a ticket.
     */
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponseDTO> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {
        return ResponseEntity.ok(ticketActionService.assignTechnician(id, technicianId));
    }

    /**
     * PATCH /api/tickets/{id}/resolve: Resolve a ticket with a note.
     */
    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TicketResponseDTO> resolveTicket(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.smartcampus.operationshub.entity.User user) {
        String note = payload.get("resolutionNote");
        return ResponseEntity.ok(ticketActionService.resolveTicket(id, user.getId(), note));
    }

    /**
     * PATCH /api/tickets/{id}/close: Close a resolved ticket.
     */
    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TicketResponseDTO> closeTicket(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.smartcampus.operationshub.entity.User user) {
        return ResponseEntity.ok(ticketActionService.closeTicket(id, user.getId()));
    }
}
