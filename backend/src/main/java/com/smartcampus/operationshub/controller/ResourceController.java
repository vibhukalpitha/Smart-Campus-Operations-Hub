package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.dto.ResourceCreateRequest;
import com.smartcampus.operationshub.dto.ResourceDTO;
import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import com.smartcampus.operationshub.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private static final CacheControl READ_CACHE_POLICY = CacheControl
            .maxAge(60, TimeUnit.SECONDS)
            .cachePublic();

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
     * Get resources with optional filters
     * GET /api/resources?type=&minCapacity=&location=&name=&status=&page=&size=&sort=
     */
    @GetMapping
    public ResponseEntity<Page<ResourceDTO>> getResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) ResourceStatus status,
            @PageableDefault(size = 12, sort = "name") Pageable pageable) {
        Page<ResourceDTO> resources = resourceService.searchResources(type, minCapacity, location, name, status, pageable);
        return ResponseEntity.ok()
            .cacheControl(READ_CACHE_POLICY)
            .body(resources);
    }

    /**
     * Get resource by ID
     * GET /api/resources/{id}
     * NOTE: This MUST be LAST after all specific routes
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable("id") Long id) {
        ResourceDTO resource = resourceService.getResourceById(id);
        return ResponseEntity.ok()
                .cacheControl(READ_CACHE_POLICY)
                .body(resource);
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
