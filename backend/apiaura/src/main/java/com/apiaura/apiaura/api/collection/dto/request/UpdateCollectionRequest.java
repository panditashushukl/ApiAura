package com.apiaura.apiaura.api.collection.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateCollectionRequest(

        @Size(max = 150, message = "Collection name must not exceed 150 characters")
        String name,

        @Size(max = 5000, message = "Description must not exceed 5000 characters")
        String description,

        @Size(max = 2048, message = "Base URL must not exceed 2048 characters")
        String baseUrl,

        @Size(max = 50000, message = "Documentation must not exceed 50000 characters")
        String documentation
) {
}
