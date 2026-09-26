package com.apiaura.apiaura.api.request.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRequestHeaderRequest(

        @NotBlank(message = "Header key is required")
        @Size(max = 255)
        String headerKey,

        @Size(max = 10000)
        String headerValue,

        Boolean enabled,

        Boolean secret,

        Integer sortOrder
) {
}
