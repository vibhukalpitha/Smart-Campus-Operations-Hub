package com.smartcampus.operationshub.repository;

import com.smartcampus.operationshub.entity.Resource;
import com.smartcampus.operationshub.entity.ResourceStatus;
import com.smartcampus.operationshub.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    /**
     * Find resources by type, capacity, and location with filtering
     */
    @Query("SELECT r FROM Resource r WHERE " +
            "(:type IS NULL OR r.type = :type) AND " +
            "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
            "(:location IS NULL OR r.location = :location) AND " +
            "(:status IS NULL OR r.status = :status)")
    List<Resource> findByTypeCapacityAndLocation(
            @Param("type") ResourceType type,
            @Param("minCapacity") Integer minCapacity,
            @Param("location") String location,
            @Param("status") ResourceStatus status
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
