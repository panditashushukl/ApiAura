package com.apiaura.apiaura.identity.permission.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePermissionRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 100)
    private String code;

    @NotBlank
    @Size(max = 100)
    private String resource;

    @NotBlank
    @Size(max = 100)
    private String action;

    @Size(max = 500)
    private String description;
}
