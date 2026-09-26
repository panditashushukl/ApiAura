package com.apiaura.apiaura.api.request.dto.request;

import com.apiaura.apiaura.foundation.common.enums.BodyType;
import com.apiaura.apiaura.foundation.common.enums.HttpMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateApiRequest(

        @NotBlank(message = "Request name is required")
        @Size(max = 150)
        String name,

        @NotNull(message = "HTTP method is required")
        HttpMethod method,

        @NotBlank(message = "Request URL is required")
        @Size(max = 4096)
        String url,

        @Size(max = 5000)
        String description,

        @Size(max = 50000)
        String documentation,

        @NotNull
        BodyType bodyType,

        String body,

        Boolean enabled,

        UUID folderId,

        UUID parentRequestId
) {
}
