package com.apiaura.apiaura.org.organization.service;

import com.apiaura.apiaura.foundation.common.enums.InvitationStatus;
import com.apiaura.apiaura.identity.auth.dto.response.AuthResponse;
import com.apiaura.apiaura.org.organization.dto.request.AcceptAndRegisterRequest;
import com.apiaura.apiaura.org.organization.dto.request.AcceptInvitationRequest;
import com.apiaura.apiaura.org.organization.dto.request.CreateInvitationRequest;
import com.apiaura.apiaura.org.organization.dto.response.OrganizationInvitationResponse;
import com.apiaura.apiaura.org.organization.dto.response.VerifyInvitationResponse;

import java.util.List;
import java.util.UUID;

public interface OrganizationInvitationService {

    OrganizationInvitationResponse createInvitation(
            UUID inviterId,
            UUID organizationId,
            CreateInvitationRequest request
    );

    List<OrganizationInvitationResponse> getInvitationsByOrganization(
            UUID currentUserId,
            UUID organizationId,
            InvitationStatus status
    );

    VerifyInvitationResponse verifyInvitation(String token);

    OrganizationInvitationResponse acceptInvitation(
            UUID currentUserId,
            AcceptInvitationRequest request
    );

    OrganizationInvitationResponse rejectInvitation(
            UUID currentUserId,
            AcceptInvitationRequest request
    );

    AuthResponse acceptAndRegister(
            AcceptAndRegisterRequest request
    );

    OrganizationInvitationResponse cancelInvitation(
            UUID currentUserId,
            UUID organizationId,
            UUID invitationId
    );
}

