package com.smartcampus.operationshub.ticketing.service;

import com.smartcampus.operationshub.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.ticketing.constant.TicketStatus;
import com.smartcampus.operationshub.ticketing.dto.TicketResponseDTO;
import com.smartcampus.operationshub.ticketing.entity.Ticket;
import com.smartcampus.operationshub.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of TicketActionService.
 */
@Service
@RequiredArgsConstructor
public class TicketActionServiceImpl implements TicketActionService {

    private final TicketRepository ticketRepository;
    private final com.smartcampus.operationshub.repository.UserRepository userRepository;

    @Override
    @Transactional
    public TicketResponseDTO updateStatus(Long id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        // Validation for illegal transitions could be added here
        // For now, we allow any valid enum value as per generic requirements
        ticket.setStatus(status);
        
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponseDTO assignTechnician(Long id, Long technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.RESOLVED) {
            throw new IllegalStateException("Cannot assign a technician to a closed or resolved ticket.");
        }

        var technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));
        
        if (!technician.getRole().name().equals("TECHNICIAN")) {
            throw new IllegalArgumentException("User is not a TECHNICIAN");
        }

        ticket.setAssignedTo(technicianId);
        // Requirement: assigning a technician sets status to IN_PROGRESS
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponseDTO resolveTicket(Long id, Long technicianId, String resolutionNote) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.RESOLVED) {
            throw new IllegalStateException("Ticket is already closed or resolved.");
        }

        if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().equals(technicianId)) {
            throw new org.springframework.security.access.AccessDeniedException("You are not assigned to this ticket.");
        }

        if (resolutionNote == null || resolutionNote.trim().isEmpty()) {
            throw new IllegalArgumentException("Resolution note is required.");
        }

        ticket.setResolutionNote(resolutionNote);
        ticket.setResolvedAt(java.time.LocalDateTime.now());
        ticket.setStatus(TicketStatus.RESOLVED);

        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponseDTO closeTicket(Long id, Long requesterId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        if (!ticket.getCreatedBy().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("You are not the owner of this ticket.");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new IllegalStateException("Ticket must be RESOLVED before it can be closed.");
        }

        ticket.setStatus(TicketStatus.CLOSED);

        return mapToResponse(ticketRepository.save(ticket));
    }

    /**
     * Helper method to map Ticket entity to TicketResponseDTO.
     * (Re-implemented as I cannot modify TicketServiceImpl to make it public/extract to a mapper)
     */
    private TicketResponseDTO mapToResponse(Ticket ticket) {
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .createdBy(ticket.getCreatedBy())
                .assignedTo(ticket.getAssignedTo())
                .contactDetails(ticket.getContactDetails())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolutionNote(ticket.getResolutionNote())
                .resolvedAt(ticket.getResolvedAt())
                .build();
    }
}
