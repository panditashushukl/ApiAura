package com.apiaura.apiaura.identity.user.service;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.identity.role.repository.RoleRepository;
import com.apiaura.apiaura.identity.role.repository.UserRoleRepository;
import com.apiaura.apiaura.identity.user.dto.response.UserResponse;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.organization.entity.Organization;
import com.apiaura.apiaura.org.organization.repository.OrganizationRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private UUID ownerId;
    private UUID orgId;
    private User owner;
    private Organization organization;

    @BeforeEach
    void setUp() {
        ownerId = UUID.randomUUID();
        orgId = UUID.randomUUID();

        owner = new User();
        owner.setId(ownerId);
        owner.setEmail("owner@acme.com");
        owner.setName("Org Owner");
        owner.setStatus(UserStatus.ACTIVE);

        organization = new Organization();
        organization.setId(orgId);
        organization.setName("Acme Corp");
        organization.setSlug("acme-corp");
        organization.setOwner(owner);

        owner.setOrganization(organization);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetByOrganizationId_WhenOwnerRequests_ReturnsUsers() {
        // Authenticate as owner
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                ownerId.toString(), null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("user:read"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(userRepository.findById(ownerId)).thenReturn(Optional.of(owner));

        User member = new User();
        member.setId(UUID.randomUUID());
        member.setEmail("member@acme.com");
        member.setName("Member One");
        member.setStatus(UserStatus.ACTIVE);
        member.setOrganization(organization);

        when(userRepository.findByOrganizationId(orgId)).thenReturn(new ArrayList<>(List.of(member)));

        List<UserResponse> result = userService.getByOrganizationId(orgId);

        assertNotNull(result);
        assertEquals(2, result.size()); // member + owner automatically included
        assertTrue(result.stream().anyMatch(u -> u.getId().equals(ownerId)));
        assertTrue(result.stream().anyMatch(u -> u.getId().equals(member.getId())));
    }

    @Test
    void testGetByOrganizationId_WhenMemberOfOtherOrgRequests_ThrowsAccessDenied() {
        UUID strangerId = UUID.randomUUID();
        User stranger = new User();
        stranger.setId(strangerId);
        stranger.setEmail("stranger@other.com");
        stranger.setStatus(UserStatus.ACTIVE);

        Organization otherOrg = new Organization();
        otherOrg.setId(UUID.randomUUID());
        stranger.setOrganization(otherOrg);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                strangerId.toString(), null, List.of(new SimpleGrantedAuthority("user:read"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(userRepository.findById(strangerId)).thenReturn(Optional.of(stranger));

        assertThrows(AccessDeniedException.class, () -> userService.getByOrganizationId(orgId));
    }

    @Test
    void testGetByOrganizationId_WhenSuperAdminRequests_BypassesOwnershipCheck() {
        UUID superAdminId = UUID.randomUUID();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                superAdminId.toString(), null, List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(userRepository.findByOrganizationId(orgId)).thenReturn(List.of(owner));

        List<UserResponse> result = userService.getByOrganizationId(orgId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(ownerId, result.get(0).getId());
    }

    @Test
    void testGetByOrganizationId_WhenOrgNotFound_ThrowsException() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getByOrganizationId(orgId));
    }
}

