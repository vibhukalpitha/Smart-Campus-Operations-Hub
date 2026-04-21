package com.smartcampus.operationshub.ticketing.controller;

import com.smartcampus.operationshub.ticketing.entity.TicketImage;
import com.smartcampus.operationshub.ticketing.service.TicketImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller for Ticket Image Uploads.
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketImageController {

    private final TicketImageService ticketImageService;

    /**
     * POST /api/tickets/{id}/images: Upload an image for a ticket.
     * Maximum 3 images per ticket.
     */
    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketImage> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return new ResponseEntity<>(ticketImageService.uploadImage(id, file), HttpStatus.CREATED);
    }

    /**
     * GET /api/tickets/{id}/images: Retrieve all images for a ticket.
     */
    @GetMapping("/{id}/images")
    public ResponseEntity<List<TicketImage>> getImages(@PathVariable Long id) {
        return ResponseEntity.ok(ticketImageService.getImagesByTicketId(id));
    }

    /**
     * POST /api/tickets/{id}/images/url: Add an image URL (e.g. Cloudinary) for a ticket.
     */
    @PostMapping("/{id}/images/url")
    public ResponseEntity<TicketImage> addImageUrl(
            @PathVariable Long id,
            @RequestBody String imageUrl) {
        return new ResponseEntity<>(ticketImageService.addImageUrl(id, imageUrl), HttpStatus.CREATED);
    }
}
