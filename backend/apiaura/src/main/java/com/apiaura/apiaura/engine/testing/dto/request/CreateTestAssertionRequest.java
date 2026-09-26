package com.apiaura.apiaura.engine.testing.dto.request;

import com.apiaura.apiaura.engine.testing.enums.AssertionType;
import jakarta.validation.constraints.NotNull;

public record CreateTestAssertionRequest(

        @NotNull
        AssertionType assertionType,

        String target,

        String expectedValue,

        Boolean enabled,

        Integer sortOrder
) {
}
