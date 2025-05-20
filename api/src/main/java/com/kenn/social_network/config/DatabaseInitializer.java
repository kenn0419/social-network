package com.kenn.social_network.config;

import com.kenn.social_network.domain.Permission;
import com.kenn.social_network.domain.Role;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.enums.MethodEnum;
import com.kenn.social_network.enums.UserStatus;
import com.kenn.social_network.repository.PermissionRepository;
import com.kenn.social_network.repository.RoleRepository;
import com.kenn.social_network.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;


@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public void run(String... args) throws Exception {
        long roleCounts = this.roleRepository.count();
        long userCounts = this.userRepository.count();
        long permissionCounts = this.permissionRepository.count();

        if (permissionCounts == 0) {
            ArrayList<Permission> arr = new ArrayList<>();

            // USERS
            arr.add(new Permission("Create a user", "/api/v1/users", MethodEnum.POST, "USERS"));
            arr.add(new Permission("Get a user by id", "/api/v1/users/{id}", MethodEnum.GET, "USERS"));
            arr.add(new Permission("Get all users", "/api/v1/users", MethodEnum.GET, "USERS"));
            arr.add(new Permission("Update a user", "/api/v1/users", MethodEnum.PUT, "USERS"));
            arr.add(new Permission("Delete a user", "/api/v1/users/{id}", MethodEnum.DELETE, "USERS"));

            // POSTS
            arr.add(new Permission("Create a post", "/api/v1/posts", MethodEnum.POST, "POSTS"));
            arr.add(new Permission("Get a post by id", "/api/v1/posts/{id}", MethodEnum.GET, "POSTS"));
            arr.add(new Permission("Get all posts", "/api/v1/posts", MethodEnum.GET, "POSTS"));
            arr.add(new Permission("Update a post", "/api/v1/posts", MethodEnum.PUT, "POSTS"));
            arr.add(new Permission("Delete a post", "/api/v1/posts/{id}", MethodEnum.DELETE, "POSTS"));

            // COMMENTS (bao gồm Reply)
            arr.add(new Permission("Create a comment", "/api/v1/comments", MethodEnum.POST, "COMMENTS"));
            arr.add(new Permission("Get a comment by id", "/api/v1/comments/{id}", MethodEnum.GET, "COMMENTS"));
            arr.add(new Permission("Get all comments", "/api/v1/comments", MethodEnum.GET, "COMMENTS"));
            arr.add(new Permission("Update a comment", "/api/v1/comments", MethodEnum.PUT, "COMMENTS"));
            arr.add(new Permission("Delete a comment", "/api/v1/comments/{id}", MethodEnum.DELETE, "COMMENTS"));

            // LIKES
            arr.add(new Permission("Like a post", "/api/v1/likes", MethodEnum.POST, "LIKES"));
            arr.add(new Permission("Get likes by post id", "/api/v1/likes/post/{postId}", MethodEnum.GET, "LIKES"));
            arr.add(new Permission("Delete a like", "/api/v1/likes/{id}", MethodEnum.DELETE, "LIKES"));

            // MESSAGES (bao gồm cá nhân và group)
            arr.add(new Permission("Send a message", "/api/v1/messages", MethodEnum.POST, "MESSAGES"));
            arr.add(new Permission("Get a message by id", "/api/v1/messages/{id}", MethodEnum.GET, "MESSAGES"));
            arr.add(new Permission("Get all messages", "/api/v1/messages", MethodEnum.GET, "MESSAGES"));
            arr.add(new Permission("Delete a message", "/api/v1/messages/{id}", MethodEnum.DELETE, "MESSAGES"));

            // CHAT GROUPS
            arr.add(new Permission("Create a chat group", "/api/v1/chat-groups", MethodEnum.POST, "CHAT_GROUPS"));
            arr.add(new Permission("Get a chat group by id", "/api/v1/chat-groups/{id}", MethodEnum.GET, "CHAT_GROUPS"));
            arr.add(new Permission("Get all chat groups", "/api/v1/chat-groups", MethodEnum.GET, "CHAT_GROUPS"));
            arr.add(new Permission("Update a chat group", "/api/v1/chat-groups", MethodEnum.PUT, "CHAT_GROUPS"));
            arr.add(new Permission("Delete a chat group", "/api/v1/chat-groups/{id}", MethodEnum.DELETE, "CHAT_GROUPS"));

            // FRIENDSHIPS
            arr.add(new Permission("Send a friend request", "/api/v1/friendships", MethodEnum.POST, "FRIENDSHIPS"));
            arr.add(new Permission("Accept a friend request", "/api/v1/friendships/{id}/accept", MethodEnum.POST, "FRIENDSHIPS"));
            arr.add(new Permission("Reject a friend request", "/api/v1/friendships/{id}/reject", MethodEnum.POST, "FRIENDSHIPS"));
            arr.add(new Permission("Delete a friendship", "/api/v1/friendships/{id}", MethodEnum.DELETE, "FRIENDSHIPS"));
            arr.add(new Permission("List friends", "/api/v1/friendships", MethodEnum.GET, "FRIENDSHIPS"));

            // NOTIFICATIONS
            arr.add(new Permission("Get all notifications", "/api/v1/notifications", MethodEnum.GET, "NOTIFICATIONS"));
            arr.add(new Permission("Mark notification as read", "/api/v1/notifications/{id}/read", MethodEnum.PUT, "NOTIFICATIONS"));
            arr.add(new Permission("Delete a notification", "/api/v1/notifications/{id}", MethodEnum.DELETE, "NOTIFICATIONS"));

            // ROLES
            arr.add(new Permission("Create a role", "/api/v1/roles", MethodEnum.POST, "ROLES"));
            arr.add(new Permission("Get a role by id", "/api/v1/roles/{id}", MethodEnum.GET, "ROLES"));
            arr.add(new Permission("Get all roles", "/api/v1/roles", MethodEnum.GET, "ROLES"));
            arr.add(new Permission("Update a role", "/api/v1/roles", MethodEnum.PUT, "ROLES"));
            arr.add(new Permission("Delete a role", "/api/v1/roles/{id}", MethodEnum.DELETE, "ROLES"));

            // PERMISSIONS
            arr.add(new Permission("Create a permission", "/api/v1/permissions", MethodEnum.POST, "PERMISSIONS"));
            arr.add(new Permission("Get a permission by id", "/api/v1/permissions/{id}", MethodEnum.GET, "PERMISSIONS"));
            arr.add(new Permission("Get all permissions", "/api/v1/permissions", MethodEnum.GET, "PERMISSIONS"));
            arr.add(new Permission("Update a permission", "/api/v1/permissions", MethodEnum.PUT, "PERMISSIONS"));
            arr.add(new Permission("Delete a permission", "/api/v1/permissions/{id}", MethodEnum.DELETE, "PERMISSIONS"));

            // POST MEDIA
            arr.add(new Permission("Add media to post", "/api/v1/posts/{postId}/media", MethodEnum.POST, "POST_MEDIA"));
            arr.add(new Permission("Delete media from post", "/api/v1/posts/{postId}/media/{mediaId}", MethodEnum.DELETE, "POST_MEDIA"));
            arr.add(new Permission("Get media by post", "/api/v1/posts/{postId}/media", MethodEnum.GET, "POST_MEDIA"));

            this.permissionRepository.saveAll(arr);
        }


        if (roleCounts == 0) {
            List<Permission> permissions = this.permissionRepository.findAll();
            List<String> modules = Arrays.asList("POST_MEDIA", "POSTS", "COMMENTS", "FRIENDSHIPS", "CHAT_GROUPS", "MESSAGES");
            List<Permission> userPermissions = this.permissionRepository.findByModuleIn(modules);
            Role adminRole = new Role();
            adminRole.setName("ADMIN");
            adminRole.setDescription("Full permissions");
            adminRole.setPermissions(permissions);

            Role customerRole = new Role();
            customerRole.setName("USER");
            customerRole.setDescription("Role for users");
            customerRole.setPermissions(userPermissions);

            ArrayList<Role> roles = new ArrayList<>();
            roles.add(adminRole);
            roles.add(customerRole);

            this.roleRepository.saveAll(roles);

        }

        if (userCounts == 0) {
            User adminUser = new User();
            adminUser.setEmail("admin@gmail.com");
            adminUser.setAddress("QN");
            adminUser.setFirstName("Boss");
            adminUser.setLastName("Admin");
            adminUser.setPassword(passwordEncoder.encode("123123az"));
            adminUser.setStatus(UserStatus.ACTIVE);

            Role adminRole = this.roleRepository.findByName("ADMIN");
            if (adminRole != null) {
                adminUser.setRole(adminRole);
            }
            this.userRepository.save(adminUser);
        }
    }
}
