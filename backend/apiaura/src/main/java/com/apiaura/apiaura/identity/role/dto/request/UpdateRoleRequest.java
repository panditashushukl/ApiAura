package com.apiaura.apiaura.identity.role.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateRoleRequest {

    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;
}
