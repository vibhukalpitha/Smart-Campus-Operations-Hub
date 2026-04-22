package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.ResourceCreateRequest;
import com.smartcampus.operationshub.dto.ResourceDTO;
import com.smartcampus.operationshub.entity.Resource;
import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import com.smartcampus.operationshub.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.repository.BookingRepository;
import com.smartcampus.operationshub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    /**
     * Create a new resource
     */
    public ResourceDTO createResource(ResourceCreateRequest request) {
        // Validate availability time range
        validateAvailabilityTime(request.getAvailableFrom(), request.getAvailableTo());

        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .status(request.getStatus() != null ? request.getStatus() : ResourceStatus.ACTIVE)
                .availableFrom(request.getAvailableFrom())
                .availableTo(request.getAvailableTo())
                // Public Computers
                .deviceBrand(request.getDeviceBrand())
                .processor(request.getProcessor())
                .ramCapacity(request.getRamCapacity())
                .networkAccess(request.getNetworkAccess())
                // Cricket
                .bats(request.getBats())
                .balls(request.getBalls())
                .stumps(request.getStumps())
                // Badminton
                .rackets(request.getRackets())
                .shuttlecocks(request.getShuttlecocks())
                .build();

        Resource savedResource = resourceRepository.save(resource);
        return mapToDTO(savedResource);
    }

    /**
     * Validate that availableFrom is before availableTo
     */
    private void validateAvailabilityTime(java.time.LocalTime availableFrom, java.time.LocalTime availableTo) {
        if (availableFrom != null && availableTo != null) {
            if (!availableFrom.isBefore(availableTo)) {
                throw new IllegalArgumentException("Invalid availability time range: availableTo must be after availableFrom");
            }
        }
    }

    private String normalizeOptionalSearchText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Get all resources
     */
    @Transactional(readOnly = true)
    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get resource by ID
     */
    @Transactional(readOnly = true)
    public ResourceDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        return mapToDTO(resource);
    }

    /**
     * Update an existing resource
     */
    public ResourceDTO updateResource(Long id, ResourceCreateRequest request) {
        // Validate availability time range
        validateAvailabilityTime(request.getAvailableFrom(), request.getAvailableTo());

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());

        if (request.getStatus() != null) {
            resource.setStatus(request.getStatus());
        }

        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());

        // Public Computers metadata
        resource.setDeviceBrand(request.getDeviceBrand());
        resource.setProcessor(request.getProcessor());
        resource.setRamCapacity(request.getRamCapacity());
        resource.setNetworkAccess(request.getNetworkAccess());

        // Cricket metadata
        resource.setBats(request.getBats());
        resource.setBalls(request.getBalls());
        resource.setStumps(request.getStumps());

        // Badminton metadata
        resource.setRackets(request.getRackets());
        resource.setShuttlecocks(request.getShuttlecocks());

        Resource updatedResource = resourceRepository.save(resource);
        return mapToDTO(updatedResource);
    }

    /**
     * Delete a resource (and its associated bookings to satisfy FK constraint).
     */
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with ID: " + id);
        }
        bookingRepository.deleteAllByResourceId(id);
        resourceRepository.deleteById(id);
    }

    /**
     * Search resources by optional filters
     */
    @Transactional(readOnly = true)
    public Page<ResourceDTO> searchResources(ResourceType type, Integer minCapacity, String location, String name, ResourceStatus status, Pageable pageable) {
        String normalizedLocation = normalizeOptionalSearchText(location);
        String normalizedName = normalizeOptionalSearchText(name);

        return resourceRepository
                .findByFilters(type, minCapacity, normalizedLocation, normalizedName, status, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Get resources by type
     */
    @Transactional(readOnly = true)
    public List<ResourceDTO> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get resources by location
     */
    @Transactional(readOnly = true)
    public List<ResourceDTO> getResourcesByLocation(String location) {
        return resourceRepository.findByLocation(location).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all active resources
     */
    @Transactional(readOnly = true)
    public List<ResourceDTO> getActiveResources() {
        return resourceRepository.findByStatusOrderByName(ResourceStatus.ACTIVE).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Map Resource entity to ResourceDTO
     */
    private ResourceDTO mapToDTO(Resource resource) {
        long booked = bookingRepository.sumApprovedAttendeesByResourceId(resource.getId());
        int available = Math.max(0, resource.getCapacity() - (int) booked);
        return ResourceDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .status(resource.getStatus())
                .availableFrom(resource.getAvailableFrom())
                .availableTo(resource.getAvailableTo())
                .createdAt(resource.getCreatedAt())
                .bookedCount((int) booked)
                .availableSeats(available)
                // Public Computers
                .deviceBrand(resource.getDeviceBrand())
                .processor(resource.getProcessor())
                .ramCapacity(resource.getRamCapacity())
                .networkAccess(resource.getNetworkAccess())
                // Cricket
                .bats(resource.getBats())
                .balls(resource.getBalls())
                .stumps(resource.getStumps())
                // Badminton
                .rackets(resource.getRackets())
                .shuttlecocks(resource.getShuttlecocks())
                .build();
    }
}
