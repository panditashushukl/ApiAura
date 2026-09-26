package com.apiaura.apiaura.engine.ai.provider;

public record AiProviderTool(
        String name,
        String description,
        Object inputSchema
) {
}
