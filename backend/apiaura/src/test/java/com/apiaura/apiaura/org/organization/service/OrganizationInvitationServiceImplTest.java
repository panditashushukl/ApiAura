package com.apiaura.apiaura.org.organization.service;

import com.apiaura.apiaura.foundation.common.enums.InvitationStatus;
import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.email.EmailService;
import com.apiaura.apiaura.identity.auth.dto.response.AuthResponse;
import com.apiaura.apiaura.identity.auth.service.AuthService;
import com.apiaura.apiaura.identity.role.entity.Role;
import com.apiaura.apiaura.identity.role.entity.UserRole;
import com.apiaura.apiaura.identity.role.repository.RoleRepository;
import com.apiaura.apiaura.identity.role.repository.UserRoleRepository;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.organization.dto.request.AcceptAndRegisterRequest;
import com.apiaura.apiaura.org.organization.dto.request.AcceptInvitationRequest;
import com.apiaura.apiaura.org.organization.dto.request.CreateInvitationRequest;
import com.apiaura.apiaura.org.organization.dto.response.OrganizationInvitationResponse;
import com.apiaura.apiaura.org.organization.dto.response.VerifyInvitationResponse;
import com.apiaura.apiaura.org.organization.entity.Organization;
import com.apiaura.apiaura.org.organization.entity.OrganizationInvitation;
import com.apiaura.apiaura.org.organization.repository.OrganizationInvitationRepository;
import com.apiaura.apiaura.org.organization.repository.OrganizationRepository;
import com.apiaura.apiaura.org.organization.security.InvitationCryptoService;
import com.apiaura.apiaura.org.organization.security.InvitationTokenPayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrganizationInvitationServiceImplTest {

    @Mock
    private OrganizationInvitationRepository invitationRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private AuthService authService;

    private InvitationCryptoService cryptoService;
    private OrganizationInvitationServiceImpl invitationService;

    private User inviter;
    private Organization organization;
    private Role adminRole;
    private Role devRole;

    @BeforeEach
    void setUp() {
        cryptoService = new InvitationCryptoService(
                new ObjectMapper(),
                "super-secure-production-jwt-secret-key-32-chars-long"
        );

        invitationService = new OrganizationInvitationServiceImpl(
                invitationRepository,
                organizationRepository,
                userRepository,
                roleRepository,
                userRoleRepository,
                cryptoService,
                emailService,
                authService
        );

        ReflectionTestUtils.setField(invitationService, "frontendUrl", "http://localhost:4200");

        inviter = new User();
        inviter.setId(UUID.randomUUID());
        inviter.setName("Alice Admin");
        inviter.setEmail("admin@acme.com");
        inviter.setStatus(UserStatus.ACTIVE);
        inviter.setRoles(new HashSet<>());

        organization = new Organization();
        organization.setId(UUID.randomUUID());
        organization.setName("Acme Corp");
        organization.setSlug("acme-corp");
        organization.setOwner(inviter);

        adminRole = new Role();
        adminRole.setId(UUID.randomUUID());
        adminRole.setName("Admin");
        adminRole.setCode("ADMIN");

        devRole = new Role();
        devRole.setId(UUID.randomUUID());
        devRole.setName("Developer");
        devRole.setCode("DEVELOPER");
    }

    @Test
    @DisplayName("Should successfully create invitation and send email")
    void testCreateInvitationSuccess() {
        CreateInvitationRequest req = new CreateInvitationRequest();
        req.setEmail("bob@acme.com");
        req.setRoleCode("DEVELOPER");

        when(userRepository.findById(inviter.getId())).thenReturn(Optional.of(inviter));
        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findByEmail("bob@acme.com")).thenReturn(Optional.empty());
        when(roleRepository.findByCode("DEVELOPER")).thenReturn(Optional.of(devRole));
        when(invitationRepository.save(any(OrganizationInvitation.class))).thenAnswer(invocation -> {
            OrganizationInvitation inv = invocation.getArgument(0);
            return inv;
        });

        OrganizationInvitationResponse resp = invitationService.createInvitation(
                inviter.getId(), organization.getId(), req
        );

        assertThat(resp).isNotNull();
        assertThat(resp.getEmail()).isEqualTo("bob@acme.com");
        assertThat(resp.getRoleCode()).isEqualTo("DEVELOPER");
        assertThat(resp.getOrganizationName()).isEqualTo("Acme Corp");
        assertThat(resp.getInvitationUrl()).contains("http://localhost:4200/invite/accept?token=");

        verify(emailService).sendOrganizationInvitation(
                eq("bob@acme.com"),
                eq("Acme Corp"),
                eq("Developer"),
                eq("Alice Admin"),
                anyString(),
                any(Instant.class)
        );
    }

    @Test
    @DisplayName("Should reject invitation creation if inviter is not authorized")
    void testCreateInvitationUnauthorizedInviter() {
        User randomUser = new User();
        randomUser.setId(UUID.randomUUID());
        randomUser.setName("Charlie");
        randomUser.setEmail("charlie@other.com");
        randomUser.setRoles(new HashSet<>());

        CreateInvitationRequest req = new CreateInvitationRequest();
        req.setEmail("target@acme.com");

        when(userRepository.findById(randomUser.getId())).thenReturn(Optional.of(randomUser));
        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));

        assertThatThrownBy(() -> invitationService.createInvitation(randomUser.getId(), organization.getId(), req))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("administrative permissions");
    }

    @Test
    @DisplayName("Should reject invitation if user is already a member of the organization")
    void testCreateInvitationAlreadyMember() {
        User existingMember = new User();
        existingMember.setId(UUID.randomUUID());
        existingMember.setEmail("member@acme.com");
        existingMember.setOrganization(organization);

        CreateInvitationRequest req = new CreateInvitationRequest();
        req.setEmail("member@acme.com");

        when(userRepository.findById(inviter.getId())).thenReturn(Optional.of(inviter));
        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findByEmail("member@acme.com")).thenReturn(Optional.of(existingMember));

        assertThatThrownBy(() -> invitationService.createInvitation(inviter.getId(), organization.getId(), req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already a member");
    }

    @Test
    @DisplayName("Should verify valid invitation token")
    void testVerifyInvitationValid() {
        UUID inviteId = UUID.randomUUID();
        Instant exp = Instant.now().plus(7, ChronoUnit.DAYS);

        InvitationTokenPayload payload = InvitationTokenPayload.builder()
                .invitationId(inviteId)
                .organizationId(organization.getId())
                .email("invitee@acme.com")
                .roleId(devRole.getId())
                .roleCode(devRole.getCode())
                .expiresAtEpochMs(exp.toEpochMilli())
                .build();

        String token = cryptoService.encrypt(payload);
        String tokenHash = cryptoService.hashToken(token);

        OrganizationInvitation inv = new OrganizationInvitation();
        inv.setId(inviteId);
        inv.setOrganization(organization);
        inv.setEmail("invitee@acme.com");
        inv.setRole(devRole);
        inv.setInvitedBy(inviter);
        inv.setStatus(InvitationStatus.PENDING);
        inv.setExpiresAt(exp);
        inv.setToken(token);
        inv.setTokenHash(tokenHash);

        when(invitationRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(inv));
        when(userRepository.existsByEmail("invitee@acme.com")).thenReturn(false);

        VerifyInvitationResponse result = invitationService.verifyInvitation(token);

        assertThat(result.isValid()).isTrue();
        assertThat(result.getEmail()).isEqualTo("invitee@acme.com");
        assertThat(result.getOrganizationName()).isEqualTo("Acme Corp");
        assertThat(result.getRoleCode()).isEqualTo("DEVELOPER");
        assertThat(result.isUserExists()).isFalse();
    }

    @Test
    @DisplayName("Should successfully accept invitation for logged-in user with matching email")
    void testAcceptInvitationSuccess() {
        User loggedInUser = new User();
        loggedInUser.setId(UUID.randomUUID());
        loggedInUser.setEmail("developer@acme.com");
        loggedInUser.setRoles(new HashSet<>());

        UUID inviteId = UUID.randomUUID();
        Instant exp = Instant.now().plus(7, ChronoUnit.DAYS);

        InvitationTokenPayload payload = InvitationTokenPayload.builder()
                .invitationId(inviteId)
                .organizationId(organization.getId())
                .email("developer@acme.com")
                .roleId(devRole.getId())
                .roleCode(devRole.getCode())
                .expiresAtEpochMs(exp.toEpochMilli())
                .build();

        String token = cryptoService.encrypt(payload);
        String tokenHash = cryptoService.hashToken(token);

        OrganizationInvitation inv = new OrganizationInvitation();
        inv.setId(inviteId);
        inv.setOrganization(organization);
        inv.setEmail("developer@acme.com");
        inv.setRole(devRole);
        inv.setInvitedBy(inviter);
        inv.setStatus(InvitationStatus.PENDING);
        inv.setExpiresAt(exp);
        inv.setToken(token);
        inv.setTokenHash(tokenHash);

        when(userRepository.findById(loggedInUser.getId())).thenReturn(Optional.of(loggedInUser));
        when(invitationRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(inv));
        when(invitationRepository.save(any(OrganizationInvitation.class))).thenAnswer(i -> i.getArgument(0));

        AcceptInvitationRequest acceptReq = new AcceptInvitationRequest();
        acceptReq.setToken(token);

        OrganizationInvitationResponse resp = invitationService.acceptInvitation(loggedInUser.getId(), acceptReq);

        assertThat(resp.getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
        assertThat(loggedInUser.getOrganization()).isEqualTo(organization);
        verify(userRepository).save(loggedInUser);
        verify(userRoleRepository).save(any(UserRole.class));
    }

    @Test
    @DisplayName("Should reject accept if logged-in user email does not match invitation email")
    void testAcceptInvitationEmailMismatch() {
        User wrongUser = new User();
        wrongUser.setId(UUID.randomUUID());
        wrongUser.setEmail("wrong-user@acme.com");

        UUID inviteId = UUID.randomUUID();
        Instant exp = Instant.now().plus(7, ChronoUnit.DAYS);

        InvitationTokenPayload payload = InvitationTokenPayload.builder()
                .invitationId(inviteId)
                .organizationId(organization.getId())
                .email("intended@acme.com")
                .roleId(devRole.getId())
                .roleCode(devRole.getCode())
                .expiresAtEpochMs(exp.toEpochMilli())
                .build();

        String token = cryptoService.encrypt(payload);
        String tokenHash = cryptoService.hashToken(token);

        OrganizationInvitation inv = new OrganizationInvitation();
        inv.setId(inviteId);
        inv.setOrganization(organization);
        inv.setEmail("intended@acme.com");
        inv.setRole(devRole);
        inv.setInvitedBy(inviter);
        inv.setStatus(InvitationStatus.PENDING);
        inv.setExpiresAt(exp);
        inv.setToken(token);
        inv.setTokenHash(tokenHash);

        when(userRepository.findById(wrongUser.getId())).thenReturn(Optional.of(wrongUser));
        when(invitationRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(inv));

        AcceptInvitationRequest acceptReq = new AcceptInvitationRequest();
        acceptReq.setToken(token);

        assertThatThrownBy(() -> invitationService.acceptInvitation(wrongUser.getId(), acceptReq))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("switch accounts");
    }

    @Test
    @DisplayName("Should successfully accept and register a new user in one flow")
    void testAcceptAndRegisterSuccess() {
        UUID inviteId = UUID.randomUUID();
        Instant exp = Instant.now().plus(7, ChronoUnit.DAYS);

        InvitationTokenPayload payload = InvitationTokenPayload.builder()
                .invitationId(inviteId)
                .organizationId(organization.getId())
                .email("newuser@acme.com")
                .roleId(devRole.getId())
                .roleCode(devRole.getCode())
                .expiresAtEpochMs(exp.toEpochMilli())
                .build();

        String token = cryptoService.encrypt(payload);
        String tokenHash = cryptoService.hashToken(token);

        OrganizationInvitation inv = new OrganizationInvitation();
        inv.setId(inviteId);
        inv.setOrganization(organization);
        inv.setEmail("newuser@acme.com");
        inv.setRole(devRole);
        inv.setInvitedBy(inviter);
        inv.setStatus(InvitationStatus.PENDING);
        inv.setExpiresAt(exp);
        inv.setToken(token);
        inv.setTokenHash(tokenHash);

        when(invitationRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(inv));
        when(userRepository.existsByEmail("newuser@acme.com")).thenReturn(false);

        User createdUser = new User();
        createdUser.setId(UUID.randomUUID());
        createdUser.setEmail("newuser@acme.com");
        createdUser.setName("New User");

        when(authService.registerInvitedUser(
                eq("New User"),
                eq("newuser@acme.com"),
                eq("Secret123!"),
                eq("+123456789"),
                eq(organization),
                eq(devRole)
        )).thenReturn(createdUser);

        AuthResponse mockAuthResp = AuthResponse.builder()
                .accessToken("mock-access-token")
                .refreshToken("mock-refresh-token")
                .build();
        when(authService.issueSession(createdUser)).thenReturn(mockAuthResp);

        AcceptAndRegisterRequest regReq = new AcceptAndRegisterRequest();
        regReq.setToken(token);
        regReq.setName("New User");
        regReq.setPassword("Secret123!");
        regReq.setMobileNumber("+123456789");

        AuthResponse authResponse = invitationService.acceptAndRegister(regReq);

        assertThat(authResponse).isNotNull();
        assertThat(authResponse.getAccessToken()).isEqualTo("mock-access-token");
        assertThat(inv.getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
        verify(invitationRepository).save(inv);
    }
}

