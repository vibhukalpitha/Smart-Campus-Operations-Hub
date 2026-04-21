package com.smartcampus.operationshub.ticketing.service;

import org.springframework.web.multipart.MultipartFile;
import com.smartcampus.operationshub.ticketing.entity.TicketImage;
import java.util.List;

/**
 * Service interface for Ticket image operations.
 */
public interface TicketImageService {
    
    /**
     * Upload an image for a specific ticket.
     * @param ticketId The ID of the ticket
     * @param file The image file
     * @return The saved TicketImage entity
     */
    TicketImage uploadImage(Long ticketId, MultipartFile file);
    
    /**
     * Store an image URL for a specific ticket (e.g. from Cloudinary).
     */
    TicketImage addImageUrl(Long ticketId, String imageUrl);
    
    /**
     * Get all images for a specific ticket.
     * @param ticketId The ID of the ticket
     * @return List of TicketImage entities
     */
    List<TicketImage> getImagesByTicketId(Long ticketId);
}
