package com.apiaura.apiaura.engine.ai.provider;

public record AiProviderResponse(
        String content,
        String toolName,
        String toolArguments,
        boolean toolCall
) {

    public static AiProviderResponse text(
            String content
    ) {
        return new AiProviderResponse(
                content,
                null,
                null,
                false
        );
    }

    public static AiProviderResponse toolCall(
            String toolName,
            String toolArguments
    ) {
        return new AiProviderResponse(
                null,
                toolName,
                toolArguments,
                true
        );
    }
}
