package com.apiaura.apiaura.api.request.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateQueryParameterRequest(

        @NotBlank(message = "Parameter key is required")
        @Size(max = 255)
        String paramKey,

        @Size(max = 10000)
        String paramValue,

        Boolean enabled,

        Integer sortOrder
) {
}
