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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Instant;
import java.util.List;
import java.util.function.Consumer;

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

    @Autowired(required = false)
    private com.apiaura.apiaura.org.organization.repository.OrganizationRepository organizationRepository;

    @Autowired(required = false)
    private ApplicationContext applicationContext;

    @Autowired(required = false)
    private PlatformTransactionManager transactionManager;

    private Consumer<Integer> exitHandler = System::exit;

    // Package-private setter for unit testing exit behavior
    void setExitHandler(Consumer<Integer> exitHandler) {
        this.exitHandler = exitHandler;
    }

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
    public void run(ApplicationArguments args) {
        if (!isSeedRequested(args)) {
            log.info("AdminDataInitializer: Seeding skipped (default behavior). Pass '--seed' or argument 'seed' via CLI to seed initial permissions, roles, and admin user.");
            return;
        }

        log.info("AdminDataInitializer: CLI seeding requested. Starting database seeding...");

        if (transactionManager != null) {
            new TransactionTemplate(transactionManager).executeWithoutResult(status -> performSeeding(args));
        } else {
            performSeeding(args);
        }

        if (isExitRequested(args)) {
            log.info("AdminDataInitializer: Exit requested via CLI flag ('--exit'). Shutting down application gracefully...");
            int exitCode = 0;
            if (applicationContext != null) {
                exitCode = SpringApplication.exit(applicationContext, () -> 0);
            }
            if (exitHandler != null) {
                exitHandler.accept(exitCode);
            }
        }
    }

    @Transactional
    public void performSeeding(ApplicationArguments args) {
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
        permissionRepository.findByCode("api:read").ifPresent(p -> {
            if (!rolePermissionRepository.existsByRoleIdAndPermissionId(guestRole.getId(), p.getId())) {
                RolePermission rp = new RolePermission();
                rp.setRole(guestRole);
                rp.setPermission(p);
                rp.setAssignedAt(Instant.now());
                rolePermissionRepository.save(rp);
            }
        });
        permissionRepository.findByCode("collection:read").ifPresent(p -> {
            if (!rolePermissionRepository.existsByRoleIdAndPermissionId(guestRole.getId(), p.getId())) {
                RolePermission rp = new RolePermission();
                rp.setRole(guestRole);
                rp.setPermission(p);
                rp.setAssignedAt(Instant.now());
                rolePermissionRepository.save(rp);
            }
        });

        // 4. Find or create default Admin user (allowing CLI override if passed)
        String cliEmail = getOptionValue(args, "admin-email");
        String cliPassword = getOptionValue(args, "admin-password");
        String cliName = getOptionValue(args, "admin-name");

        String email = cliEmail != null ? cliEmail.toLowerCase() : ((adminEmail != null && !adminEmail.isBlank())
                ? adminEmail.trim().toLowerCase()
                : "admin@apiaura.com");
        String password = cliPassword != null ? cliPassword : ((adminPassword != null && !adminPassword.isBlank())
                ? adminPassword
                : "admin123");
        String name = cliName != null ? cliName : ((adminName != null && !adminName.isBlank())
                ? adminName
                : "Super Admin");

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

    public void performSeeding() {
        performSeeding(null);
    }

    public boolean isSeedRequested(ApplicationArguments args) {
        if (args == null) {
            return false;
        }
        if (args.containsOption("seed") || args.containsOption("seed-data") || args.containsOption("init-data")) {
            return true;
        }
        List<String> nonOptionArgs = args.getNonOptionArgs();
        if (nonOptionArgs != null) {
            for (String arg : nonOptionArgs) {
                if ("seed".equalsIgnoreCase(arg) || "seed-data".equalsIgnoreCase(arg) || "init-data".equalsIgnoreCase(arg)) {
                    return true;
                }
            }
        }
        return false;
    }

    public boolean isExitRequested(ApplicationArguments args) {
        if (args == null) {
            return false;
        }
        if (args.containsOption("exit") || args.containsOption("exit-after-seed") || args.containsOption("seed-only")) {
            return true;
        }
        List<String> nonOptionArgs = args.getNonOptionArgs();
        if (nonOptionArgs != null) {
            for (String arg : nonOptionArgs) {
                if ("exit".equalsIgnoreCase(arg) || "seed-only".equalsIgnoreCase(arg) || "exit-after-seed".equalsIgnoreCase(arg)) {
                    return true;
                }
            }
        }
        return false;
    }

    private String getOptionValue(ApplicationArguments args, String optionName) {
        if (args != null && args.containsOption(optionName)) {
            List<String> values = args.getOptionValues(optionName);
            if (values != null && !values.isEmpty() && values.get(0) != null && !values.get(0).isBlank()) {
                return values.get(0).trim();
            }
        }
        return null;
    }

    private void seedDefaultPermissions() {
        List<PermissionDefinition> defaultDefs = List.of(
                // 1. Organisation
                new PermissionDefinition("Create Organization", "organization:create", "organization", "create",
                        "Allows creating organizations"),
                new PermissionDefinition("Read Organization", "organization:read", "organization", "read",
                        "Allows viewing organization details"),
                new PermissionDefinition("Update Organization", "organization:update", "organization", "update",
                        "Allows modifying organization settings"),
                new PermissionDefinition("Delete Organization", "organization:delete", "organization", "delete",
                        "Allows deleting organizations"),

                // 2. Collection
                new PermissionDefinition("Create Collection", "collection:create", "collection", "create",
                        "Allows creating collections and folders"),
                new PermissionDefinition("Read Collection", "collection:read", "collection", "read",
                        "Allows viewing collections and folders"),
                new PermissionDefinition("Update Collection", "collection:update", "collection", "update",
                        "Allows modifying collections and folders"),
                new PermissionDefinition("Delete Collection", "collection:delete", "collection", "delete",
                        "Allows deleting collections and folders"),

                // 3. Environment
                new PermissionDefinition("Create Environment", "environment:create", "environment", "create",
                        "Allows creating environments and variables"),
                new PermissionDefinition("Read Environment", "environment:read", "environment", "read",
                        "Allows viewing environments and variables"),
                new PermissionDefinition("Update Environment", "environment:update", "environment", "update",
                        "Allows modifying environments and variables"),
                new PermissionDefinition("Delete Environment", "environment:delete", "environment", "delete",
                        "Allows deleting environments and variables"),

                // 4. API
                new PermissionDefinition("Create API", "api:create", "api", "create",
                        "Allows creating APIs and requests"),
                new PermissionDefinition("Read API", "api:read", "api", "read", "Allows viewing APIs and requests"),
                new PermissionDefinition("Update API", "api:update", "api", "update",
                        "Allows modifying APIs and requests"),
                new PermissionDefinition("Delete API", "api:delete", "api", "delete",
                        "Allows deleting APIs and requests"),

                // 5. Workflows
                new PermissionDefinition("Create Workflow", "workflow:create", "workflow", "create",
                        "Allows creating automated workflows"),
                new PermissionDefinition("Read Workflow", "workflow:read", "workflow", "read",
                        "Allows viewing workflows and executions"),
                new PermissionDefinition("Update Workflow", "workflow:update", "workflow", "update",
                        "Allows modifying workflow definitions and steps"),
                new PermissionDefinition("Delete Workflow", "workflow:delete", "workflow", "delete",
                        "Allows deleting workflows"),

                // 6. Users
                new PermissionDefinition("Create User", "user:create", "user", "create",
                        "Allows creating and inviting users"),
                new PermissionDefinition("Read User", "user:read", "user", "read", "Allows viewing users and roles"),
                new PermissionDefinition("Update User", "user:update", "user", "update",
                        "Allows updating user details and status"),
                new PermissionDefinition("Delete User", "user:delete", "user", "delete",
                        "Allows deleting user accounts"),

                // 7. Roles (A Super Admin role cannot be deleted)
                new PermissionDefinition("Create Role", "role:create", "role", "create",
                        "Allows creating custom RBAC roles"),
                new PermissionDefinition("Read Role", "role:read", "role", "read",
                        "Allows viewing roles and assigned permissions"),
                new PermissionDefinition("Update Role", "role:update", "role", "update",
                        "Allows updating role definitions and permissions"),
                new PermissionDefinition("Delete Role", "role:delete", "role", "delete",
                        "Allows deleting custom roles (Super Admin role cannot be deleted)"),

                // 8. Workspace Members
                new PermissionDefinition("Create Workspace Member", "workspace_member:create", "workspace_member",
                        "create", "Allows adding members to workspace"),
                new PermissionDefinition("Read Workspace Member", "workspace_member:read", "workspace_member", "read",
                        "Allows viewing workspace members and invitations"),
                new PermissionDefinition("Update Workspace Member", "workspace_member:update", "workspace_member",
                        "update", "Allows modifying workspace member roles and status"),
                new PermissionDefinition("Delete Workspace Member", "workspace_member:delete", "workspace_member",
                        "delete", "Allows removing members from workspace"),

                // 9. Test Cases
                new PermissionDefinition("Create Test Case", "test_case:create", "test_case", "create",
                        "Allows creating test cases and assertions"),
                new PermissionDefinition("Read Test Case", "test_case:read", "test_case", "read",
                        "Allows viewing test cases and execution results"),
                new PermissionDefinition("Update Test Case", "test_case:update", "test_case", "update",
                        "Allows modifying test cases and assertions"),
                new PermissionDefinition("Delete Test Case", "test_case:delete", "test_case", "delete",
                        "Allows deleting test cases and assertions"));

        // Seed or update the 36 canonical permissions
        for (PermissionDefinition def : defaultDefs) {
            Permission permission = permissionRepository.findByCode(def.code())
                    .orElseGet(Permission::new);
            permission.setName(def.name());
            permission.setCode(def.code());
            permission.setResource(def.resource());
            permission.setAction(def.action());
            permission.setDescription(def.description());
            permissionRepository.save(permission);
        }
    }

    private record PermissionDefinition(
            String name,
            String code,
            String resource,
            String action,
            String description) {
    }
}
