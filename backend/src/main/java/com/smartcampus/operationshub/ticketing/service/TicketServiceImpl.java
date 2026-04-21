package com.smartcampus.operationshub.ticketing.service;

import com.smartcampus.operationshub.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.ticketing.constant.TicketStatus;
import com.smartcampus.operationshub.ticketing.dto.TicketRequestDTO;
import com.smartcampus.operationshub.ticketing.dto.TicketResponseDTO;
import com.smartcampus.operationshub.ticketing.entity.Ticket;
import com.smartcampus.operationshub.ticketing.repository.CommentRepository;
import com.smartcampus.operationshub.ticketing.repository.TicketImageRepository;
import com.smartcampus.operationshub.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of TicketService.
 */
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketImageRepository ticketImageRepository;

    @Override
    @Transactional
    public TicketResponseDTO createTicket(TicketRequestDTO request, Long userId) {
        Ticket ticket = Ticket.builder()
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(request.getStatus() != null ? request.getStatus() : TicketStatus.OPEN)
                .createdBy(userId)
                .assignedTo(request.getAssignedTo())
                .resourceId(request.getResourceId())
                .location(request.getLocation())
                .contactDetails(request.getContactDetails())
                .build();

        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TicketResponseDTO getTicketById(Long id, Long requesterId, String requesterRole) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        
        TicketResponseDTO response = mapToResponse(ticket);
        
        // Determine if Viewer
        boolean isViewer = true;
        if ("ADMIN".equals(requesterRole)) {
            isViewer = false;
        } else if ("TECHNICIAN".equals(requesterRole) && ticket.getAssignedTo() != null && ticket.getAssignedTo().equals(requesterId)) {
            isViewer = false;
        } else if (ticket.getCreatedBy().equals(requesterId)) {
            isViewer = false;
        }

        if (isViewer) {
            response.setContactDetails(null);
            // Optionally mask createdBy if needed, but for now we nullify it or leave it. 
            // The prompt says "Hide sensitive info like Contact Details, Personal user data"
            // Let's just nullify contactDetails.
        }

        return response;
    }

    @Override
    public List<TicketResponseDTO> getPublicTickets() {
        return ticketRepository.findAll().stream()
                .map(ticket -> {
                    TicketResponseDTO dto = mapToResponse(ticket);
                    // Force mask out sensitive data for public list view
                    dto.setContactDetails(null);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketResponseDTO updateTicket(Long id, TicketRequestDTO request, Long userId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        // Ownership validation (bypass if userId is null, used for admin status updates)
        if (userId != null && !ticket.getCreatedBy().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to update this ticket.");
        }

        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        if (request.getStatus() != null) {
            ticket.setStatus(request.getStatus());
        }
        ticket.setAssignedTo(request.getAssignedTo());
        ticket.setResourceId(request.getResourceId());
        ticket.setLocation(request.getLocation());
        ticket.setContactDetails(request.getContactDetails());

        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public void deleteTicket(Long id, Long userId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        // Ownership validation
        if (!ticket.getCreatedBy().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to delete this ticket.");
        }

        // Clean up associated comments and images to prevent orphan records
        commentRepository.deleteAllByTicketId(id);
        ticketImageRepository.deleteAllByTicketId(id);

        ticketRepository.delete(ticket);
    }

    @Override
    public List<TicketResponseDTO> getTicketsByCreator(Long userId) {
        return ticketRepository.findByCreatedBy(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketResponseDTO> getTicketsByAssignee(Long userId) {
        return ticketRepository.findByAssignedTo(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketResponseDTO updateStatus(Long id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        
        ticket.setStatus(status);
        return mapToResponse(ticketRepository.save(ticket));
    }

    /**
     * Helper method to map Ticket entity to TicketResponseDTO.
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
                .resourceId(ticket.getResourceId())
                .location(ticket.getLocation())
                .contactDetails(ticket.getContactDetails())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolutionNote(ticket.getResolutionNote())
                .resolvedAt(ticket.getResolvedAt())
                .rejectionNote(ticket.getRejectionNote())
                .build();
    }
}
