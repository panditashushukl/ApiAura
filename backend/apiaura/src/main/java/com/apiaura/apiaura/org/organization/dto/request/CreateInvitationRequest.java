package com.apiaura.apiaura.org.organization.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateInvitationRequest {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Valid email address is required")
    private String email;

    private UUID roleId;

    private String roleCode;
}

