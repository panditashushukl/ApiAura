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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDataInitializerTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private RolePermissionRepository rolePermissionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminDataInitializer adminDataInitializer;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminDataInitializer, "adminEmail", "admin@apiaura.com");
        ReflectionTestUtils.setField(adminDataInitializer, "adminPassword", "admin123");
        ReflectionTestUtils.setField(adminDataInitializer, "adminName", "System Admin");
        ReflectionTestUtils.setField(adminDataInitializer, "adminRoleCode", "ADMIN");
        ReflectionTestUtils.setField(adminDataInitializer, "adminRoleName", "Administrator");
    }

    @Test
    void testRunWithoutSeedFlagSkipsSeeding() {
        ApplicationArguments args = new DefaultApplicationArguments();

        adminDataInitializer.run(args);

        verifyNoInteractions(roleRepository);
        verifyNoInteractions(permissionRepository);
        verifyNoInteractions(userRepository);
        verifyNoInteractions(userRoleRepository);
        verifyNoInteractions(rolePermissionRepository);
    }

    @Test
    void testRunWithSeedOptionExecutesSeeding() {
        ApplicationArguments args = new DefaultApplicationArguments("--seed");

        mockSuccessfulSeedingRepositories();

        adminDataInitializer.run(args);

        verify(roleRepository, atLeastOnce()).save(any(Role.class));
        verify(rolePermissionRepository, atLeastOnce()).save(any(RolePermission.class));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("admin@apiaura.com", savedUser.getEmail());
        assertEquals("encodedPassword123", savedUser.getPasswordHash());
        assertEquals(UserStatus.ACTIVE, savedUser.getStatus());

        verify(userRoleRepository).save(any(UserRole.class));
    }

    @Test
    void testRunWithPositionalSeedArgExecutesSeeding() {
        ApplicationArguments args = new DefaultApplicationArguments("seed");

        mockSuccessfulSeedingRepositories();

        adminDataInitializer.run(args);

        verify(roleRepository, atLeastOnce()).save(any(Role.class));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRunWithSeedAndExitFlagExecutesSeedingAndTerminates() {
        ApplicationArguments args = new DefaultApplicationArguments("--seed", "--exit");

        mockSuccessfulSeedingRepositories();

        AtomicInteger exitCodeCaptured = new AtomicInteger(-1);
        adminDataInitializer.setExitHandler(exitCodeCaptured::set);

        adminDataInitializer.run(args);

        verify(userRepository).save(any(User.class));
        assertEquals(0, exitCodeCaptured.get());
    }

    @Test
    void testRunWithCustomAdminCredentialsViaCli() {
        ApplicationArguments args = new DefaultApplicationArguments(
                "--seed",
                "--admin-email=custom@apiaura.com",
                "--admin-password=CustomPass456!",
                "--admin-name=Custom Owner"
        );

        mockSuccessfulSeedingRepositories();
        when(userRepository.findByEmail("custom@apiaura.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("CustomPass456!")).thenReturn("encodedCustomPassword");

        adminDataInitializer.run(args);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("custom@apiaura.com", savedUser.getEmail());
        assertEquals("Custom Owner", savedUser.getName());
        assertEquals("encodedCustomPassword", savedUser.getPasswordHash());
    }

    private void mockSuccessfulSeedingRepositories() {
        lenient().when(roleRepository.findByCode(anyString())).thenReturn(Optional.empty());
        Role mockRole = new Role();
        mockRole.setId(UUID.randomUUID());
        mockRole.setCode("ADMIN");
        mockRole.setName("Administrator");
        mockRole.setSystemRole(true);
        lenient().when(roleRepository.save(any(Role.class))).thenReturn(mockRole);

        Permission p1 = new Permission();
        p1.setId(UUID.randomUUID());
        p1.setCode("api:create");
        lenient().when(permissionRepository.findAll()).thenReturn(List.of(p1));

        lenient().when(userRepository.findByEmail("admin@apiaura.com")).thenReturn(Optional.empty());
        lenient().when(passwordEncoder.encode("admin123")).thenReturn("encodedPassword123");

        User mockUser = new User();
        mockUser.setId(UUID.randomUUID());
        mockUser.setEmail("admin@apiaura.com");
        mockUser.setStatus(UserStatus.ACTIVE);
        lenient().when(userRepository.save(any(User.class))).thenReturn(mockUser);

        lenient().when(rolePermissionRepository.existsByRoleIdAndPermissionId(any(), any())).thenReturn(false);
        lenient().when(userRoleRepository.existsByUserIdAndRoleId(any(), any())).thenReturn(false);
    }
}
