package com.apiaura.apiaura.api.collection.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateCollectionRequest(

        @Size(max = 150, message = "Collection name must not exceed 150 characters")
        String name,

        @Size(max = 5000, message = "Description must not exceed 5000 characters")
        String description,

        String preRequestScript,

        String postRequestScript,

        @Size(max = 50000, message = "Documentation must not exceed 50000 characters")
        String documentation
) {
}
