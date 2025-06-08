package com.kenn.social_network.domain;

import com.kenn.social_network.enums.GroupStatusEnum;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_groups")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Group extends BaseEntity {

    @Column(name = "group_name")
    private String name;

    @Column(name = "group_description")
    private String description;

    @Column(name = "group_status")
    @Enumerated(EnumType.STRING)
    private GroupStatusEnum groupStatus;

    @Column(name = "is_block")
    private boolean isBlock;

    @Column(name = "cover_url")
    private String coverUrl;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToMany
    private List<User> members = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "group")
    private List<Post> posts = new ArrayList<>();
}
