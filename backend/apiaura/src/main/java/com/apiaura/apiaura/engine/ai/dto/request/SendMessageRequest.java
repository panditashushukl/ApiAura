package com.apiaura.apiaura.engine.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(

        @NotBlank
        @Size(max = 20000)
        String message
) {
}
