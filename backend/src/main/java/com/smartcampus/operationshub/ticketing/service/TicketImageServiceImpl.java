package com.smartcampus.operationshub.ticketing.service;

import com.smartcampus.operationshub.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.ticketing.entity.TicketImage;
import com.smartcampus.operationshub.ticketing.repository.TicketImageRepository;
import com.smartcampus.operationshub.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

/**
 * Implementation of TicketImageService.
 */
@Service
@RequiredArgsConstructor
public class TicketImageServiceImpl implements TicketImageService {

    private final TicketImageRepository ticketImageRepository;
    private final TicketRepository ticketRepository;

    private static final List<String> ALLOWED_EXTENSIONS = List.of(".jpg", ".jpeg", ".png");
    private static final int MAX_IMAGES_PER_TICKET = 3;
    private static final String UPLOAD_DIR = "uploads/tickets/";

    @Override
    @Transactional
    public TicketImage uploadImage(Long ticketId, MultipartFile file) {
        // 1. Verify ticket exists
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + ticketId);
        }

        // 2. Enforce 3-image limit
        long count = ticketImageRepository.countByTicketId(ticketId);
        if (count >= MAX_IMAGES_PER_TICKET) {
            throw new IllegalArgumentException("Maximum of " + MAX_IMAGES_PER_TICKET + " images allowed per ticket.");
        }

        // 3. Validate format
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }
        
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported file format. Please use JPG, JPEG, or PNG.");
        }

        // 4. Prepare upload directory
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 5. Generate unique filename
            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(newFilename);

            // 6. Save file metadata to DB and copy file
            Files.copy(file.getInputStream(), filePath);

            TicketImage ticketImage = TicketImage.builder()
                    .ticketId(ticketId)
                    .imageUrl(filePath.toString()) // Storing local path as URL for legacy support
                    .build();

            return ticketImageRepository.save(ticketImage);

        } catch (IOException e) {
            throw new RuntimeException("Could not store image. Error: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public TicketImage addImageUrl(Long ticketId, String imageUrl) {
        // 1. Verify ticket exists
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + ticketId);
        }

        // 2. Enforce 3-image limit
        long count = ticketImageRepository.countByTicketId(ticketId);
        if (count >= MAX_IMAGES_PER_TICKET) {
            throw new IllegalArgumentException("Maximum of " + MAX_IMAGES_PER_TICKET + " images allowed per ticket.");
        }

        TicketImage ticketImage = TicketImage.builder()
                .ticketId(ticketId)
                .imageUrl(imageUrl)
                .build();

        return ticketImageRepository.save(ticketImage);
    }

    @Override
    public List<TicketImage> getImagesByTicketId(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + ticketId);
        }
        return ticketImageRepository.findByTicketId(ticketId);
    }
}
