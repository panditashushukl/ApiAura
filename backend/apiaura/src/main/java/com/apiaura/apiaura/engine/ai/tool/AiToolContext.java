package com.apiaura.apiaura.engine.ai.tool;

import java.util.UUID;

public record AiToolContext(
        UUID userId,
        UUID workspaceId,
        UUID sessionId
) {
}
