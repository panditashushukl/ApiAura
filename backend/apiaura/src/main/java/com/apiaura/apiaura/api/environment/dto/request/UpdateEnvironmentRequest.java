package com.apiaura.apiaura.api.environment.dto.request;

import com.apiaura.apiaura.environment.enums.EnvironmentStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateEnvironmentRequest(

        @Size(max = 150)
        String name,

        @Size(max = 150)
        @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug must contain only lowercase letters, numbers and hyphens"
        )
        String slug,

        @Size(max = 5000)
        String description,

        EnvironmentStatus status,

        Boolean active
) {
}
