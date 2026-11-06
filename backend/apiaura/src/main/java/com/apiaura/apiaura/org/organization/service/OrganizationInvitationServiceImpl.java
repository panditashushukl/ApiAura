package com.apiaura.apiaura.org.organization.service;

import com.apiaura.apiaura.foundation.common.enums.InvitationStatus;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationInvitationServiceImpl implements OrganizationInvitationService {

    private final OrganizationInvitationRepository invitationRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final InvitationCryptoService cryptoService;
    private final EmailService emailService;
    private final AuthService authService;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    private static final int INVITATION_EXPIRATION_DAYS = 7;

    @Override
    @Transactional
    public OrganizationInvitationResponse createInvitation(
            UUID inviterId,
            UUID organizationId,
            CreateInvitationRequest request
    ) {
        User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new ResourceNotFoundException("Inviter user not found: " + inviterId));

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + organizationId));

        // 1. Permission check: inviter must be Org Owner, Org Admin, or SUPER_ADMIN
        assertCanManageInvitations(inviter, organization);

        String email = request.getEmail().trim().toLowerCase();

        // 2. Validate email is not already an active member of this organization
        userRepository.findByEmail(email).ifPresent(existingUser -> {
            if (existingUser.getOrganization() != null &&
                    existingUser.getOrganization().getId().equals(organizationId)) {
                throw new BadRequestException("User with email " + email + " is already a member of this organization");
            }
        });

        // 3. Resolve role to assign
        Role roleToAssign = resolveRole(request, organizationId, inviter);

        // 4. Cancel any existing PENDING invitation for this email in this org
        invitationRepository.findByOrganizationIdAndEmailIgnoreCaseAndStatus(
                organizationId, email, InvitationStatus.PENDING
        ).ifPresent(existingInvite -> {
            existingInvite.setStatus(InvitationStatus.CANCELLED);
            invitationRepository.save(existingInvite);
        });

        // 5. Build invitation entity and secure encrypted token
        Instant now = Instant.now();
        Instant expiresAt = now.plus(INVITATION_EXPIRATION_DAYS, ChronoUnit.DAYS);
        UUID invitationId = UUID.randomUUID();

        InvitationTokenPayload payload = InvitationTokenPayload.builder()
                .invitationId(invitationId)
                .organizationId(organizationId)
                .email(email)
                .roleId(roleToAssign.getId())
                .roleCode(roleToAssign.getCode())
                .expiresAtEpochMs(expiresAt.toEpochMilli())
                .build();

        String encryptedToken = cryptoService.encrypt(payload);
        String tokenHash = cryptoService.hashToken(encryptedToken);

        OrganizationInvitation invitation = new OrganizationInvitation();
        invitation.setId(invitationId);
        invitation.setOrganization(organization);
        invitation.setEmail(email);
        invitation.setRole(roleToAssign);
        invitation.setInvitedBy(inviter);
        invitation.setToken(encryptedToken);
        invitation.setTokenHash(tokenHash);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setInvitedAt(now);
        invitation.setExpiresAt(expiresAt);

        invitation = invitationRepository.save(invitation);

        // 6. Build acceptance URL and dispatch invitation email
        String baseUrl = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        String inviteUrl = baseUrl + "/invite/accept?token=" + encryptedToken;

        emailService.sendOrganizationInvitation(
                email,
                organization.getName(),
                roleToAssign.getName(),
                inviter.getName(),
                inviteUrl,
                expiresAt
        );

        log.info("Invitation created for {} to join org {} as {}", email, organization.getName(), roleToAssign.getCode());
        return OrganizationInvitationResponse.from(invitation, frontendUrl);
    }

    @Override
    public List<OrganizationInvitationResponse> getInvitationsByOrganization(
            UUID currentUserId,
            UUID organizationId,
            InvitationStatus status
    ) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + organizationId));

        assertCanManageInvitations(currentUser, organization);

        List<OrganizationInvitation> list = status != null
                ? invitationRepository.findByOrganizationIdAndStatus(organizationId, status)
                : invitationRepository.findByOrganizationId(organizationId);

        return list.stream()
                .map(inv -> OrganizationInvitationResponse.from(inv, frontendUrl))
                .toList();
    }

    @Override
    @Transactional
    public VerifyInvitationResponse verifyInvitation(String token) {
        try {
            InvitationTokenPayload payload = cryptoService.decrypt(token);
            String tokenHash = cryptoService.hashToken(token);

            OrganizationInvitation invitation = invitationRepository.findByTokenHash(tokenHash)
                    .orElseThrow(() -> new ResourceNotFoundException("Invitation not found or revoked"));

            Instant now = Instant.now();
            if (invitation.getExpiresAt().isBefore(now)) {
                if (invitation.getStatus() == InvitationStatus.PENDING) {
                    invitation.setStatus(InvitationStatus.EXPIRED);
                    invitationRepository.save(invitation);
                }
                return VerifyInvitationResponse.builder()
                        .valid(false)
                        .message("Invitation has expired")
                        .status(InvitationStatus.EXPIRED)
                        .expiresAt(invitation.getExpiresAt())
                        .build();
            }

            if (invitation.getStatus() != InvitationStatus.PENDING) {
                return VerifyInvitationResponse.builder()
                        .valid(false)
                        .message("Invitation has already been " + invitation.getStatus().name().toLowerCase())
                        .status(invitation.getStatus())
                        .build();
            }

            boolean userExists = userRepository.existsByEmail(invitation.getEmail());

            return VerifyInvitationResponse.builder()
                    .valid(true)
                    .message("Invitation is valid")
                    .organizationId(invitation.getOrganization().getId())
                    .organizationName(invitation.getOrganization().getName())
                    .organizationSlug(invitation.getOrganization().getSlug())
                    .email(invitation.getEmail())
                    .roleId(invitation.getRole().getId())
                    .roleName(invitation.getRole().getName())
                    .roleCode(invitation.getRole().getCode())
                    .inviterName(invitation.getInvitedBy().getName())
                    .status(invitation.getStatus())
                    .expiresAt(invitation.getExpiresAt())
                    .userExists(userExists)
                    .build();

        } catch (BadRequestException ex) {
            return VerifyInvitationResponse.builder()
                    .valid(false)
                    .message(ex.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public OrganizationInvitationResponse acceptInvitation(
            UUID currentUserId,
            AcceptInvitationRequest request
    ) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        OrganizationInvitation invitation = validateAndGetPendingInvitation(request.getToken());

        // Identity Verification: Logged-in user's email MUST match the invitation's email
        if (!currentUser.getEmail().equalsIgnoreCase(invitation.getEmail())) {
            throw new ForbiddenException("This invitation was sent to " + invitation.getEmail()
                    + ", but you are logged in as " + currentUser.getEmail()
                    + ". Please switch accounts to accept this invitation.");
        }

        // Set organization
        if (currentUser.getOrganizations() == null) {
            currentUser.setOrganizations(new java.util.HashSet<>());
        }
        if (currentUser.getOrganization() != null) {
            currentUser.getOrganizations().add(currentUser.getOrganization());
        }
        currentUser.getOrganizations().add(invitation.getOrganization());
        currentUser.setOrganization(invitation.getOrganization());

        // Assign Role if not already present
        Role targetRole = invitation.getRole();
        boolean alreadyHasRole = currentUser.getRoles().stream()
                .anyMatch(r -> r.getRole().getId().equals(targetRole.getId()));

        if (!alreadyHasRole) {
            UserRole userRole = new UserRole();
            userRole.setUser(currentUser);
            userRole.setRole(targetRole);
            userRole.setAssignedAt(Instant.now());
            userRoleRepository.save(userRole);
            currentUser.getRoles().add(userRole);
        }

        userRepository.save(currentUser);

        // Mark invitation ACCEPTED
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(Instant.now());
        invitation = invitationRepository.save(invitation);

        log.info("User {} successfully accepted invitation to join org {}", currentUser.getEmail(), invitation.getOrganization().getName());
        return OrganizationInvitationResponse.from(invitation, frontendUrl);
    }

    @Override
    @Transactional
    public OrganizationInvitationResponse rejectInvitation(
            UUID currentUserId,
            AcceptInvitationRequest request
    ) {
        OrganizationInvitation invitation = validateAndGetPendingInvitation(request.getToken());

        final String targetEmail = invitation.getEmail();
        if (currentUserId != null) {
            userRepository.findById(currentUserId).ifPresent(user -> {
                if (!user.getEmail().equalsIgnoreCase(targetEmail)) {
                    throw new ForbiddenException("This invitation was sent to a different email address.");
                }
            });
        }

        invitation.setStatus(InvitationStatus.REJECTED);
        invitation.setRespondedAt(Instant.now());
        invitation = invitationRepository.save(invitation);

        log.info("Invitation to join org {} for email {} was rejected", invitation.getOrganization().getName(), invitation.getEmail());
        return OrganizationInvitationResponse.from(invitation, frontendUrl);
    }

    @Override
    @Transactional
    public AuthResponse acceptAndRegister(
            AcceptAndRegisterRequest request
    ) {
        OrganizationInvitation invitation = validateAndGetPendingInvitation(request.getToken());

        if (userRepository.existsByEmail(invitation.getEmail())) {
            throw new BadRequestException("An account already exists for " + invitation.getEmail()
                    + ". Please log in with your credentials to accept the invitation.");
        }

        // Register new user directly into the organization with the invited role
        User newUser = authService.registerInvitedUser(
                request.getName(),
                invitation.getEmail(),
                request.getPassword(),
                request.getMobileNumber(),
                invitation.getOrganization(),
                invitation.getRole()
        );

        // Mark invitation ACCEPTED
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(Instant.now());
        invitationRepository.save(invitation);

        log.info("New user {} registered and joined org {} via invitation", newUser.getEmail(), invitation.getOrganization().getName());

        return authService.issueSession(newUser);
    }

    @Override
    @Transactional
    public OrganizationInvitationResponse cancelInvitation(
            UUID currentUserId,
            UUID organizationId,
            UUID invitationId
    ) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + organizationId));

        assertCanManageInvitations(currentUser, organization);

        OrganizationInvitation invitation = invitationRepository.findById(invitationId)
                .filter(inv -> inv.getOrganization().getId().equals(organizationId))
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found for this organization: " + invitationId));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("Only pending invitations can be cancelled. Current status: " + invitation.getStatus());
        }

        invitation.setStatus(InvitationStatus.CANCELLED);
        invitation = invitationRepository.save(invitation);

        log.info("Invitation {} cancelled by {}", invitationId, currentUser.getEmail());
        return OrganizationInvitationResponse.from(invitation, frontendUrl);
    }

    private OrganizationInvitation validateAndGetPendingInvitation(String token) {
        InvitationTokenPayload payload = cryptoService.decrypt(token);
        String tokenHash = cryptoService.hashToken(token);

        OrganizationInvitation invitation = invitationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found or invalid token"));

        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            if (invitation.getStatus() == InvitationStatus.PENDING) {
                invitation.setStatus(InvitationStatus.EXPIRED);
                invitationRepository.save(invitation);
            }
            throw new BadRequestException("This invitation has expired");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("This invitation has already been " + invitation.getStatus().name().toLowerCase());
        }

        return invitation;
    }

    private void assertCanManageInvitations(User user, Organization organization) {
        // Platform Super Admin
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(r -> "SUPER_ADMIN".equalsIgnoreCase(r.getRole().getCode()));
        if (isSuperAdmin) {
            return;
        }

        // Org Owner
        if (organization.getOwner().getId().equals(user.getId())) {
            return;
        }

        // Org Admin
        boolean isOrgAdmin = user.getOrganization() != null
                && user.getOrganization().getId().equals(organization.getId())
                && user.getRoles().stream().anyMatch(r -> "ADMIN".equalsIgnoreCase(r.getRole().getCode()));
        if (isOrgAdmin) {
            return;
        }

        throw new ForbiddenException("You do not have administrative permissions for organization: " + organization.getName());
    }

    private Role resolveRole(CreateInvitationRequest request, UUID organizationId, User inviter) {
        Role role = null;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with ID: " + request.getRoleId()));
        } else if (request.getRoleCode() != null && !request.getRoleCode().isBlank()) {
            role = roleRepository.findByCode(request.getRoleCode().trim().toUpperCase())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with code: " + request.getRoleCode()));
        } else {
            // Default to GUEST if no role requested
            role = roleRepository.findByCode("GUEST")
                    .orElseThrow(() -> new ResourceNotFoundException("Default role GUEST not found"));
        }

        // Prevent non-superadmins from assigning SUPER_ADMIN
        boolean inviterIsSuperAdmin = inviter.getRoles().stream()
                .anyMatch(r -> "SUPER_ADMIN".equalsIgnoreCase(r.getRole().getCode()));
        if ("SUPER_ADMIN".equalsIgnoreCase(role.getCode()) && !inviterIsSuperAdmin) {
            throw new ForbiddenException("Only a Super Administrator can assign the SUPER_ADMIN role");
        }

        // If role is organization-scoped, verify it belongs to this organization
        if (role.getOrganization() != null && !role.getOrganization().getId().equals(organizationId)) {
            throw new BadRequestException("Role does not belong to organization: " + organizationId);
        }

        return role;
    }
}
