package com.smartcampus.operationshub.ticketing.service;

import com.smartcampus.operationshub.ticketing.constant.TicketStatus;
import com.smartcampus.operationshub.ticketing.dto.TicketRequestDTO;
import com.smartcampus.operationshub.ticketing.dto.TicketResponseDTO;

import java.util.List;

/**
 * Service interface for Ticket operations.
 */
public interface TicketService {
    
    /**
     * Create a new ticket.
     */
    TicketResponseDTO createTicket(TicketRequestDTO request, Long userId);
    
    /**
     * Get all tickets.
     */
    List<TicketResponseDTO> getAllTickets();
    
    /**
     * Get a ticket by its ID, dynamically masking sensitive fields for unauthorized viewers.
     */
    TicketResponseDTO getTicketById(Long id, Long requesterId, String requesterRole);

    /**
     * Get all public tickets (masked for read-only view).
     */
    List<TicketResponseDTO> getPublicTickets();
    
    /**
     * Update an existing ticket.
     */
    TicketResponseDTO updateTicket(Long id, TicketRequestDTO request, Long userId);
    
    /**
     * Delete a ticket by its ID.
     */
    void deleteTicket(Long id, Long userId);
    
    /**
     * Get all tickets created by a specific user.
     */
    List<TicketResponseDTO> getTicketsByCreator(Long userId);
    
    /**
     * Get all tickets assigned to a specific user.
     */
    List<TicketResponseDTO> getTicketsByAssignee(Long userId);

    /**
     * Update the status of a ticket.
     */
    TicketResponseDTO updateStatus(Long id, TicketStatus status);
}
