package com.apiaura.apiaura.engine.ai.tool;

public record AiToolResult(
        boolean success,
        Object data,
        String error
) {

    public static AiToolResult success(
            Object data
    ) {
        return new AiToolResult(
                true,
                data,
                null
        );
    }

    public static AiToolResult failure(
            String error
    ) {
        return new AiToolResult(
                false,
                null,
                error
        );
    }
}