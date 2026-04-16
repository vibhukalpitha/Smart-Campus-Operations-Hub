package com.smartcampus.operationshub.repository;

import com.smartcampus.operationshub.entity.Resource;
import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    /**
     * Find resources by optional filters with case-insensitive name/location matching
     */
    @Query("SELECT r FROM Resource r WHERE " +
            "(:type IS NULL OR r.type = :type) AND " +
            "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
            "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:status IS NULL OR r.status = :status)")
    Page<Resource> findByFilters(
            @Param("type") ResourceType type,
            @Param("minCapacity") Integer minCapacity,
            @Param("location") String location,
            @Param("name") String name,
            @Param("status") ResourceStatus status,
            Pageable pageable
    );

    /**
     * Find all resources by type
     */
    List<Resource> findByType(ResourceType type);

    /**
     * Find all resources by location
     */
    List<Resource> findByLocation(String location);

    /**
     * Find all resources by status
     */
    List<Resource> findByStatus(ResourceStatus status);

    /**
     * Find all active resources
     */
    List<Resource> findByStatusOrderByName(ResourceStatus status);
}
