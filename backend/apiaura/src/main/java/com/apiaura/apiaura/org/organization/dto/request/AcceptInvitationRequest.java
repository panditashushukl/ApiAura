package com.apiaura.apiaura.org.organization.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AcceptInvitationRequest {

    @NotBlank(message = "Invitation token is required")
    private String token;
}

