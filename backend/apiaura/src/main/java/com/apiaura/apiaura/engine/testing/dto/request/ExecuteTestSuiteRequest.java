package com.apiaura.apiaura.engine.testing.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ExecuteTestSuiteRequest(

        @NotNull
        UUID requestExecutionId
) {
}
