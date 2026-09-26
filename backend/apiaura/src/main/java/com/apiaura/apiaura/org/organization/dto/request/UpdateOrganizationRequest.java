package com.apiaura.apiaura.org.organization.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrganizationRequest {

    @Size(min = 2, max = 150)
    private String name;

    @Size(min = 2, max = 100)
    private String slug;
}
