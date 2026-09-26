package com.apiaura.apiaura.api.environment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateEnvironmentRequest(

        @NotBlank(message = "Environment name is required")
        @Size(max = 150)
        String name,

        @NotBlank(message = "Environment slug is required")
        @Size(max = 150)
        @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug must contain only lowercase letters, numbers and hyphens"
        )
        String slug,

        @Size(max = 5000)
        String description,

        Boolean active
) {
}
