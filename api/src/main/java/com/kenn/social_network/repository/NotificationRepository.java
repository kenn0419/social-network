package com.kenn.social_network.repository;

import com.kenn.social_network.domain.Notification;
import com.kenn.social_network.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Optional<Notification> findBySenderAndReceiver(User sender, User receiver);

    List<Notification> findAllByReceiverOrderByCreatedAtDesc(User receiver);

    List<Notification> findAllByReceiverAndIsReadFalse(User receiver);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.sender.id = :senderId AND n.receiver.id = :receiverId")
    void deleteBySenderAndReceiver(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

}




