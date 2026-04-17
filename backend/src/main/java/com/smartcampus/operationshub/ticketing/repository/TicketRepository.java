package com.smartcampus.operationshub.ticketing.repository;

import com.smartcampus.operationshub.ticketing.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Ticket entity.
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    /**
     * Find tickets by the user who created them.
     */
    List<Ticket> findByCreatedBy(Long createdBy);
    
    /**
     * Find tickets assigned to a specific user.
     */
    List<Ticket> findByAssignedTo(Long assignedTo);
}
