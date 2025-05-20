package com.kenn.social_network.domain;

import com.kenn.social_network.enums.UserPresenceStatusEnum;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "user_presence")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserPresence implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private long userId;

    @Version
    private Long version;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_presence_status")
    private UserPresenceStatusEnum userPresenceStatus;

    @Column(name = "last_active_at")
    private Timestamp lastActiveAt;
}
