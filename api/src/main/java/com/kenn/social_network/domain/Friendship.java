package com.kenn.social_network.domain;

import com.kenn.social_network.enums.FriendshipStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "friendships")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Friendship extends BaseEntity{

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    @ManyToOne
    @JoinColumn(name = "addressee_id")
    private User addressee;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private FriendshipStatus status;
}
