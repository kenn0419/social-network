package com.kenn.social_network.domain;

import com.kenn.social_network.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User extends BaseEntity {

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email", unique = true, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_unicode_ci")
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(name = "bio", columnDefinition = "MEDIUMTEXT")
    private String bio;

    @Column(name = "address", columnDefinition = "MEDIUMTEXT")
    private String address;

    @Column(name = "refresh_token", columnDefinition = "MEDIUMTEXT")
    private String refreshToken;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "user_status")
    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes = new ArrayList<>();

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> sentMessages = new ArrayList<>();

    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> receivedMessages = new ArrayList<>();

    @OneToMany(mappedBy = "requester", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Friendship> sentRequests = new ArrayList<>();

    @OneToMany(mappedBy = "addressee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Friendship> receivedRequests = new ArrayList<>();

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL)
    private List<Notification> sentNotifications = new ArrayList<>();

    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL)
    private List<Notification> receivedNotifications = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof User user)) return false;
        return Objects.equals(firstName, user.firstName) && Objects.equals(lastName, user.lastName) && Objects.equals(email, user.email) && Objects.equals(password, user.password) && Objects.equals(avatarUrl, user.avatarUrl) && Objects.equals(coverUrl, user.coverUrl) && Objects.equals(bio, user.bio) && Objects.equals(address, user.address) && Objects.equals(refreshToken, user.refreshToken) && Objects.equals(role, user.role) && status == user.status && Objects.equals(posts, user.posts) && Objects.equals(comments, user.comments) && Objects.equals(likes, user.likes) && Objects.equals(sentMessages, user.sentMessages) && Objects.equals(receivedMessages, user.receivedMessages) && Objects.equals(sentRequests, user.sentRequests) && Objects.equals(receivedRequests, user.receivedRequests) && Objects.equals(sentNotifications, user.sentNotifications) && Objects.equals(receivedNotifications, user.receivedNotifications);
    }

    @Override
    public int hashCode() {
        return Objects.hash(firstName, lastName, email, password, avatarUrl, coverUrl, bio, address, refreshToken, role, status, posts, comments, likes, sentMessages, receivedMessages, sentRequests, receivedRequests, sentNotifications, receivedNotifications);
    }
}
