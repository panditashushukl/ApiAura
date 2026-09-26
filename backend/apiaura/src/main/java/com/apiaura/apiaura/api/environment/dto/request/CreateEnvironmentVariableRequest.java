package com.apiaura.apiaura.api.environment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateEnvironmentVariableRequest(

        @NotBlank(message = "Variable key is required")
        @Size(max = 150)
        String variableKey,

        @Size(max = 10000)
        String variableValue,

        @Size(max = 10000)
        String secretValue,

        Boolean secret,

        Boolean enabled
) {
}
