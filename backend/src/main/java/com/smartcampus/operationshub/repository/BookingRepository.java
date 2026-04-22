package com.smartcampus.operationshub.repository;

import com.smartcampus.operationshub.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsByResourceId(Long resourceId);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.status IN (com.smartcampus.operationshub.entity.BookingStatus.PENDING, com.smartcampus.operationshub.entity.BookingStatus.APPROVED) " +
           "AND (:startTime < b.endTime AND :endTime > b.startTime)")
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT COALESCE(SUM(b.expectedAttendees), 0) FROM Booking b " +
           "WHERE b.resource.id = :resourceId " +
           "AND b.status = com.smartcampus.operationshub.entity.BookingStatus.APPROVED")
    Long sumApprovedAttendeesByResourceId(@Param("resourceId") Long resourceId);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.user.role = com.smartcampus.operationshub.entity.Role.LECTURER " +
           "AND b.status = com.smartcampus.operationshub.entity.BookingStatus.APPROVED " +
           "AND b.startTime > CURRENT_TIMESTAMP " +
           "ORDER BY b.startTime ASC")
    List<Booking> findFutureLecturerBookings(@Param("resourceId") Long resourceId);

    @Query("SELECT b FROM Booking b WHERE b.user.role = com.smartcampus.operationshub.entity.Role.LECTURER " +
           "AND b.status = com.smartcampus.operationshub.entity.BookingStatus.APPROVED " +
           "AND b.startTime > CURRENT_TIMESTAMP " +
           "ORDER BY b.startTime ASC")
    List<Booking> findAllFutureLecturerBookings();
}

