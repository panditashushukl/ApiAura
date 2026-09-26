package com.apiaura.apiaura.engine.testing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateApiTestRequest(

        @NotNull
        UUID requestId,

        @NotBlank
        @Size(max = 150)
        String name,

        @Size(max = 2000)
        String description,

        Boolean enabled,

        Integer sortOrder
) {
}
