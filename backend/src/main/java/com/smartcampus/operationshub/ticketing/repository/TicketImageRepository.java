package com.smartcampus.operationshub.ticketing.repository;

import com.smartcampus.operationshub.ticketing.entity.TicketImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for TicketImage entity.
 */
@Repository
public interface TicketImageRepository extends JpaRepository<TicketImage, Long> {
    
    /**
     * Find all images associated with a specific ticket.
     */
    List<TicketImage> findByTicketId(Long ticketId);
    
    /**
     * Count how many images are uploaded for a specific ticket.
     */
    long countByTicketId(Long ticketId);
}
