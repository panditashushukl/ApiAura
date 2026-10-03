package com.apiaura.apiaura.identity.init;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.identity.permission.entity.Permission;
import com.apiaura.apiaura.identity.permission.entity.RolePermission;
import com.apiaura.apiaura.identity.permission.repository.PermissionRepository;
import com.apiaura.apiaura.identity.permission.repository.RolePermissionRepository;
import com.apiaura.apiaura.identity.role.entity.Role;
import com.apiaura.apiaura.identity.role.entity.UserRole;
import com.apiaura.apiaura.identity.role.repository.RoleRepository;
import com.apiaura.apiaura.identity.role.repository.UserRoleRepository;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminDataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${security.admin.email}")
    private String adminEmail;

    @Value("${security.admin.password}")
    private String adminPassword;

    @Value("${security.admin.name:System Admin}")
    private String adminName;

    @Value("${security.admin.role-code:ADMIN}")
    private String adminRoleCode;

    @Value("${security.admin.role-name:Administrator}")
    private String adminRoleName;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Running AdminDataInitializer...");

        // 1. Seed system default permissions if missing
        seedDefaultPermissions();

        // 2. Seed system default roles (SUPER_ADMIN, ADMIN, GUEST)
        Role superAdminRole = roleRepository.findByCode("SUPER_ADMIN")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("Super Admin");
                    role.setCode("SUPER_ADMIN");
                    role.setDescription("Super Administrator with platform-wide access");
                    role.setSystemRole(true);
                    return roleRepository.save(role);
                });

        Role adminRole = roleRepository.findByCode("ADMIN")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("Admin");
                    role.setCode("ADMIN");
                    role.setDescription("Organization Administrator role");
                    role.setSystemRole(true);
                    return roleRepository.save(role);
                });

        Role guestRole = roleRepository.findByCode("GUEST")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("Guest");
                    role.setCode("GUEST");
                    role.setDescription("Guest role assigned to newly registered users");
                    role.setSystemRole(true);
                    return roleRepository.save(role);
                });

        // 3. Assign ALL permissions to Super Admin and Admin Roles
        List<Permission> allPermissions = permissionRepository.findAll();
        for (Permission permission : allPermissions) {
            if (!rolePermissionRepository.existsByRoleIdAndPermissionId(superAdminRole.getId(), permission.getId())) {
                RolePermission rp = new RolePermission();
                rp.setRole(superAdminRole);
                rp.setPermission(permission);
                rp.setAssignedAt(Instant.now());
                rolePermissionRepository.save(rp);
            }
            if (!rolePermissionRepository.existsByRoleIdAndPermissionId(adminRole.getId(), permission.getId())) {
                RolePermission rp = new RolePermission();
                rp.setRole(adminRole);
                rp.setPermission(permission);
                rp.setAssignedAt(Instant.now());
                rolePermissionRepository.save(rp);
            }
        }
        log.info("Assigned {} permissions to roles SUPER_ADMIN and ADMIN", allPermissions.size());

        // Assign basic read permissions to Guest Role
        permissionRepository.findByCode("request:read").ifPresent(p -> {
            if (!rolePermissionRepository.existsByRoleIdAndPermissionId(guestRole.getId(), p.getId())) {
                RolePermission rp = new RolePermission();
                rp.setRole(guestRole);
                rp.setPermission(p);
                rp.setAssignedAt(Instant.now());
                rolePermissionRepository.save(rp);
            }
        });

        // 4. Find or create default Admin user
        String email = (adminEmail != null && !adminEmail.isBlank())
                ? adminEmail.trim().toLowerCase()
                : "admin@apiaura.com";
        String password = (adminPassword != null && !adminPassword.isBlank())
                ? adminPassword
                : "admin123";
        String name = (adminName != null && !adminName.isBlank())
                ? adminName
                : "Super Admin";

        User adminUser = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User user = new User();
                    user.setName(name);
                    user.setEmail(email);
                    user.setPasswordHash(passwordEncoder.encode(password));
                    user.setStatus(UserStatus.ACTIVE);
                    return userRepository.save(user);
                });

        if (adminUser.getStatus() != UserStatus.ACTIVE) {
            adminUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(adminUser);
        }

        // 5. Assign SUPER_ADMIN role to default admin user
        if (!userRoleRepository.existsByUserIdAndRoleId(adminUser.getId(), superAdminRole.getId())) {
            UserRole userRole = new UserRole();
            userRole.setUser(adminUser);
            userRole.setRole(superAdminRole);
            userRole.setAssignedAt(Instant.now());
            userRoleRepository.save(userRole);
            log.info("Assigned SUPER_ADMIN role to user {}", adminUser.getEmail());
        }

        log.info("AdminDataInitializer completed successfully for admin user: {}", email);
    }

    private void seedDefaultPermissions() {
        List<PermissionDefinition> defaultDefs = List.of(
                // Requests
                new PermissionDefinition("Create API Request", "request:create", "request", "create", "Allows creating API requests"),
                new PermissionDefinition("Read API Request", "request:read", "request", "read", "Allows reading API requests"),
                new PermissionDefinition("Update API Request", "request:update", "request", "update", "Allows updating API requests"),
                new PermissionDefinition("Delete API Request", "request:delete", "request", "delete", "Allows deleting API requests"),
                new PermissionDefinition("Execute API Request", "request:execute", "request", "execute", "Allows executing API requests"),

                // Collections
                new PermissionDefinition("Create Collection", "collection:create", "collection", "create", "Allows creating collections"),
                new PermissionDefinition("Read Collection", "collection:read", "collection", "read", "Allows reading collections"),
                new PermissionDefinition("Update Collection", "collection:update", "collection", "update", "Allows updating collections"),
                new PermissionDefinition("Delete Collection", "collection:delete", "collection", "delete", "Allows deleting collections"),

                // Environments
                new PermissionDefinition("Create Environment", "environment:create", "environment", "create", "Allows creating environments"),
                new PermissionDefinition("Read Environment", "environment:read", "environment", "read", "Allows reading environments"),
                new PermissionDefinition("Update Environment", "environment:update", "environment", "update", "Allows updating environments"),
                new PermissionDefinition("Delete Environment", "environment:delete", "environment", "delete", "Allows deleting environments"),

                // Workflows
                new PermissionDefinition("Create Workflow", "workflow:create", "workflow", "create", "Allows creating workflows"),
                new PermissionDefinition("Read Workflow", "workflow:read", "workflow", "read", "Allows reading workflows"),
                new PermissionDefinition("Update Workflow", "workflow:update", "workflow", "update", "Allows updating workflows"),
                new PermissionDefinition("Delete Workflow", "workflow:delete", "workflow", "delete", "Allows deleting workflows"),
                new PermissionDefinition("Execute Workflow", "workflow:execute", "workflow", "execute", "Allows executing workflows"),

                // Testing
                new PermissionDefinition("Create Test", "test:create", "test", "create", "Allows creating tests"),
                new PermissionDefinition("Read Test", "test:read", "test", "read", "Allows reading tests"),
                new PermissionDefinition("Update Test", "test:update", "test", "update", "Allows updating tests"),
                new PermissionDefinition("Delete Test", "test:delete", "test", "delete", "Allows deleting tests"),
                new PermissionDefinition("Execute Test", "test:execute", "test", "execute", "Allows executing tests"),

                // User, Role & Permission Management
                new PermissionDefinition("Manage Users", "user:manage", "user", "manage", "Allows managing users"),
                new PermissionDefinition("Manage Roles", "role:manage", "role", "manage", "Allows managing roles"),
                new PermissionDefinition("Manage Permissions", "permission:manage", "permission", "manage", "Allows managing permissions"),

                // Organization & Workspace
                new PermissionDefinition("Manage Organization", "organization:manage", "organization", "manage", "Allows managing organization"),
                new PermissionDefinition("Manage Workspace", "workspace:manage", "workspace", "manage", "Allows managing workspaces")
        );

        for (PermissionDefinition def : defaultDefs) {
            if (!permissionRepository.existsByCode(def.code())) {
                Permission permission = new Permission();
                permission.setName(def.name());
                permission.setCode(def.code());
                permission.setResource(def.resource());
                permission.setAction(def.action());
                permission.setDescription(def.description());
                permissionRepository.save(permission);
            }
        }
    }

    private record PermissionDefinition(
            String name,
            String code,
            String resource,
            String action,
            String description
    ) {}
}
