package com.apiaura.apiaura.engine.ai.tool;

import com.apiaura.apiaura.ai.enums.AiActionRisk;

import java.util.Map;

public interface AiTool {

    String getName();

    String getDescription();

    AiActionRisk getRisk();

    Map<String, Object> getInputSchema();

    AiToolResult execute(
            AiToolContext context,
            Map<String, Object> input
    );
}
