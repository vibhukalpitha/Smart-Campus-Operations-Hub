package com.smartcampus.operationshub.repository;

import com.smartcampus.operationshub.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Query("SELECT n FROM Notification n WHERE n.user IS NULL OR n.user.email = ?1 ORDER BY n.createdAt DESC")
    List<Notification> findByUserEmailOrPublic(String email);
    
    List<Notification> findAllByOrderByCreatedAtDesc();
}
