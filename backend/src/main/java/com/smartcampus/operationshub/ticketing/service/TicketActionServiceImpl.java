package com.smartcampus.operationshub.ticketing.service;

import com.smartcampus.operationshub.entity.Role;
import com.smartcampus.operationshub.entity.User;
import com.smartcampus.operationshub.service.NotificationService;
import com.smartcampus.operationshub.ticketing.constant.TicketStatus;
import com.smartcampus.operationshub.ticketing.dto.TicketResponseDTO;
import com.smartcampus.operationshub.ticketing.entity.Ticket;
import com.smartcampus.operationshub.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Implementation of TicketActionService.
 */
@Service
@RequiredArgsConstructor
public class TicketActionServiceImpl implements TicketActionService {

    private final TicketRepository ticketRepository;
    private final com.smartcampus.operationshub.repository.UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public TicketResponseDTO updateStatus(Long id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new com.smartcampus.operationshub.exception.ResourceNotFoundException("Ticket not found with id: " + id));

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(status);
        Ticket savedTicket = ticketRepository.save(ticket);

        if (oldStatus != status) {
            notifyStatusChange(savedTicket, status);
        }
        
        return mapToResponse(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponseDTO assignTechnician(Long id, Long technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new com.smartcampus.operationshub.exception.ResourceNotFoundException("Ticket not found with id: " + id));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.RESOLVED) {
            throw new IllegalStateException("Cannot assign a technician to a closed or resolved ticket.");
        }

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new com.smartcampus.operationshub.exception.ResourceNotFoundException("Technician not found with id: " + technicianId));
        
        if (!technician.getRole().name().equals("TECHNICIAN")) {
            throw new IllegalArgumentException("User is not a TECHNICIAN");
        }

        ticket.setAssignedTo(technicianId);
        // Requirement: assigning a technician sets status to IN_PROGRESS
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Notify Technician
        notificationService.createNotification(
            "New Ticket Assigned",
            "You have been assigned to resolve ticket #" + savedTicket.getId(),
            "ALERT",
            technician.getEmail()
        );

        // Notify User
        userRepository.findById(savedTicket.getCreatedBy()).ifPresent(creator -> {
            notificationService.createNotification(
                "Technician Assigned",
                "Technician " + technician.getFirstName() + " " + technician.getLastName() + " has been assigned to your ticket #" + savedTicket.getId(),
                "INFO",
                creator.getEmail()
            );
        });

        return mapToResponse(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponseDTO resolveTicket(Long id, Long technicianId, String resolutionNote) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new com.smartcampus.operationshub.exception.ResourceNotFoundException("Ticket not found with id: " + id));

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

        Ticket savedTicket = ticketRepository.save(ticket);

        // Notify User
        userRepository.findById(savedTicket.getCreatedBy()).ifPresent(creator -> {
            notificationService.createNotification(
                "Ticket Resolved",
                "Your ticket #" + savedTicket.getId() + " has been marked as resolved. Please review the resolution note.",
                "INFO",
                creator.getEmail()
            );
        });

        // Notify Admins
        String adminMsg = "Ticket #" + savedTicket.getId() + " has been resolved by the assigned technician.";
        notifyAdmins("Ticket Resolved", adminMsg, "INFO");

        return mapToResponse(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponseDTO closeTicket(Long id, Long requesterId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new com.smartcampus.operationshub.exception.ResourceNotFoundException("Ticket not found with id: " + id));

        if (!ticket.getCreatedBy().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("You are not the owner of this ticket.");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new IllegalStateException("Ticket must be RESOLVED before it can be closed.");
        }

        ticket.setStatus(TicketStatus.CLOSED);
        Ticket savedTicket = ticketRepository.save(ticket);

        // Notify Admins
        notifyAdmins("Ticket Closed", "Ticket #" + savedTicket.getId() + " has been closed by the user.", "INFO");

        return mapToResponse(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponseDTO rejectTicket(Long id, String reason) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new com.smartcampus.operationshub.exception.ResourceNotFoundException("Ticket not found with id: " + id));

        if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED) {
            throw new IllegalStateException("Ticket cannot be rejected as it is already resolved or closed.");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required.");
        }

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionNote(reason);
        Ticket savedTicket = ticketRepository.save(ticket);

        // Notify User
        userRepository.findById(savedTicket.getCreatedBy()).ifPresent(creator -> {
            notificationService.createNotification(
                "Ticket Rejected",
                "Your ticket #" + savedTicket.getId() + " has been rejected. Reason: " + reason,
                "ALERT",
                creator.getEmail()
            );
        });

        return mapToResponse(savedTicket);
    }

    private void notifyStatusChange(Ticket ticket, TicketStatus status) {
        userRepository.findById(ticket.getCreatedBy()).ifPresent(creator -> {
            notificationService.createNotification(
                "Ticket Status Updated",
                "Your ticket #" + ticket.getId() + " is now " + status,
                "INFO",
                creator.getEmail()
            );
        });

        String adminMsg = "Ticket #" + ticket.getId() + " status changed to " + status;
        notifyAdmins("Ticket Update", adminMsg, "INFO");
        
        if (status == TicketStatus.IN_PROGRESS && ticket.getAssignedTo() != null) {
            userRepository.findById(ticket.getCreatedBy()).ifPresent(creator -> {
                notificationService.createNotification(
                    "Work Started",
                    "A technician has started working on your ticket #" + ticket.getId(),
                    "INFO",
                    creator.getEmail()
                );
            });
        }
    }

    private void notifyAdmins(String title, String message, String type) {
        List<User> admins = userRepository.findAllByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(title, message, type, admin.getEmail());
        }
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
                .rejectionNote(ticket.getRejectionNote())
                .build();
    }
}
