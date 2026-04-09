package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.dto.ResourceCreateRequest;
import com.smartcampus.operationshub.dto.ResourceDTO;
import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import com.smartcampus.operationshub.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    /**
     * Create a new resource
     * POST /api/resources
     */
    @PostMapping
    public ResponseEntity<ResourceDTO> createResource(@Valid @RequestBody ResourceCreateRequest request) {
        ResourceDTO resource = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resource);
    }

    /**
     * Get all resources
     * GET /api/resources
     */
    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAllResources() {
        List<ResourceDTO> resources = resourceService.getAllResources();
        return ResponseEntity.ok(resources);
    }

    /**
     * Search resources with query parameters
     * GET /api/resources/search?type=LECTURE_HALL&minCapacity=30&location=Building A&status=ACTIVE
     * NOTE: This must be BEFORE /{id} to prevent Spring from matching 'search' as an ID
     */
    @GetMapping("/search")
    public ResponseEntity<List<ResourceDTO>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status) {
        List<ResourceDTO> resources = resourceService.searchResources(type, minCapacity, location, status);
        return ResponseEntity.ok(resources);
    }

    /**
     * Get resources by type
     * GET /api/resources/type/{type}
     * NOTE: This must be BEFORE /{id} to prevent Spring from matching 'type/{type}' as an ID
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceDTO>> getResourcesByType(@PathVariable("type") ResourceType type) {
        List<ResourceDTO> resources = resourceService.getResourcesByType(type);
        return ResponseEntity.ok(resources);
    }

    /**
     * Get resources by location
     * GET /api/resources/location/{location}
     * NOTE: This must be BEFORE /{id} to prevent Spring from matching 'location/{location}' as an ID
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<List<ResourceDTO>> getResourcesByLocation(@PathVariable("location") String location) {
        List<ResourceDTO> resources = resourceService.getResourcesByLocation(location);
        return ResponseEntity.ok(resources);
    }

    /**
     * Get all active resources
     * GET /api/resources/active
     * NOTE: This must be BEFORE /{id} to prevent Spring from matching 'active' as an ID
     */
    @GetMapping("/active")
    public ResponseEntity<List<ResourceDTO>> getActiveResources() {
        List<ResourceDTO> resources = resourceService.getActiveResources();
        return ResponseEntity.ok(resources);
    }

    /**
     * Get resource by ID
     * GET /api/resources/{id}
     * NOTE: This MUST be LAST after all specific routes
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable("id") Long id) {
        ResourceDTO resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    /**
     * Update resource
     * PUT /api/resources/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTO> updateResource(
            @PathVariable("id") Long id,
            @Valid @RequestBody ResourceCreateRequest request) {
        ResourceDTO resource = resourceService.updateResource(id, request);
        return ResponseEntity.ok(resource);
    }

    /**
     * Delete resource
     * DELETE /api/resources/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable("id") Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
