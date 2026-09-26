package com.apiaura.apiaura.engine.ai.service;

import com.apiaura.apiaura.engine.ai.dto.response.AiActionResponse;
import com.apiaura.apiaura.engine.ai.entity.AiAction;
import com.apiaura.apiaura.ai.enums.AiActionRisk;
import com.apiaura.apiaura.engine.ai.tool.AiTool;
import com.apiaura.apiaura.engine.ai.tool.AiToolContext;

import java.util.List;
import java.util.UUID;

public interface AiActionService {

    AiAction createPendingAction(
            AiToolContext context,
            AiTool tool,
            String toolName,
            String inputJson,
            AiActionRisk risk
    );

    String execute(
            AiToolContext context,
            AiTool tool,
            String inputJson,
            AiActionRisk risk
    );

    AiActionResponse confirm(
            UUID actionId
    );

    AiActionResponse reject(
            UUID actionId
    );

    List<AiActionResponse> getSessionActions(
            UUID sessionId
    );
}