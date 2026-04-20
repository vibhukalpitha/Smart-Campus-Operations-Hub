package com.smartcampus.operationshub.ticketing.controller;

import com.smartcampus.operationshub.ticketing.constant.TicketStatus;
import com.smartcampus.operationshub.ticketing.dto.TicketResponseDTO;
import com.smartcampus.operationshub.ticketing.service.TicketActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(ticketActionService.updateStatus(id, status));
    }

    /**
     * PATCH /api/tickets/{id}/assign: Assign a technician to a ticket.
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {
        return ResponseEntity.ok(ticketActionService.assignTechnician(id, technicianId));
    }
}
