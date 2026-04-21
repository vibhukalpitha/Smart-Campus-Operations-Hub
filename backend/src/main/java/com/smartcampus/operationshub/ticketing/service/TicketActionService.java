package com.smartcampus.operationshub.ticketing.service;

import com.smartcampus.operationshub.ticketing.constant.TicketStatus;
import com.smartcampus.operationshub.ticketing.dto.TicketResponseDTO;

/**
 * Service interface for extended Ticket actions like status updates and technician assignment.
 */
public interface TicketActionService {
    
    /**
     * Update the status of a ticket.
     * @param id Ticket ID
     * @param status New status
     * @return Updated ticket as DTO
     */
    TicketResponseDTO updateStatus(Long id, TicketStatus status);
    
    /**
     * Assign a technician to a ticket.
     * Assigning a technician automatically sets the status to IN_PROGRESS.
     * @param id Ticket ID
     * @param technicianId ID of the technician (User ID)
     * @return Updated ticket as DTO
     */
    TicketResponseDTO assignTechnician(Long id, Long technicianId);

    /**
     * Resolve a ticket.
     * @param id Ticket ID
     * @param technicianId ID of the technician (User ID)
     * @param resolutionNote Required textual note detailing the fix
     * @return Updated ticket as DTO
     */
    TicketResponseDTO resolveTicket(Long id, Long technicianId, String resolutionNote);

    /**
     * Close a resolved ticket.
     * @param id Ticket ID
     * @param requesterId ID of the ticket owner requesting the closure
     * @return Updated ticket as DTO
     */
    TicketResponseDTO closeTicket(Long id, Long requesterId);
}
