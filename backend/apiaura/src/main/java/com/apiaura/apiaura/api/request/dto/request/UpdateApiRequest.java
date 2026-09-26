package com.apiaura.apiaura.api.request.dto.request;

import com.apiaura.apiaura.foundation.common.enums.BodyType;
import com.apiaura.apiaura.foundation.common.enums.HttpMethod;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateApiRequest(

        @Size(max = 150)
        String name,

        HttpMethod method,

        @Size(max = 4096)
        String url,

        @Size(max = 5000)
        String description,

        @Size(max = 50000)
        String documentation,

        BodyType bodyType,

        String body,

        Boolean enabled,

        UUID folderId,

        UUID parentRequestId
) {
}
