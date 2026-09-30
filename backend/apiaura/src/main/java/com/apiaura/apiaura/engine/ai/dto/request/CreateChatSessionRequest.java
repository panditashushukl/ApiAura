package com.apiaura.apiaura.engine.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateChatSessionRequest (
    @NotBlank
    @Size(max = 200)
    String title
){}
