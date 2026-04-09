package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.ResourceCreateRequest;
import com.smartcampus.operationshub.dto.ResourceDTO;
import com.smartcampus.operationshub.entity.Resource;
import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import com.smartcampus.operationshub.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;

    /**
     * Create a new resource
     */
    public ResourceDTO createResource(ResourceCreateRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .status(request.getStatus() != null ? request.getStatus() : ResourceStatus.ACTIVE)
                .availableFrom(request.getAvailableFrom())
                .availableTo(request.getAvailableTo())
                .build();

        Resource savedResource = resourceRepository.save(resource);
        return mapToDTO(savedResource);
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

        Resource updatedResource = resourceRepository.save(resource);
        return mapToDTO(updatedResource);
    }

    /**
     * Delete a resource
     */
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with ID: " + id);
        }
        resourceRepository.deleteById(id);
    }

    /**
     * Search resources by type, capacity, and location
     */
    @Transactional(readOnly = true)
    public List<ResourceDTO> searchResources(ResourceType type, Integer minCapacity, String location, ResourceStatus status) {
        List<Resource> resources = resourceRepository.findByTypeCapacityAndLocation(type, minCapacity, location, status);
        return resources.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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
                .build();
    }
}
