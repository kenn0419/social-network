package com.kenn.social_network.repository;

import com.kenn.social_network.domain.Permission;
import com.kenn.social_network.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    List<Permission> findByModuleIn(List<String> modules);
    Role findByName(String name);
}
