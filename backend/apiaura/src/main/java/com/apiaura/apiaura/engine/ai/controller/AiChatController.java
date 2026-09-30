package com.apiaura.apiaura.engine.ai.controller;

import com.apiaura.apiaura.engine.ai.dto.request.CreateChatSessionRequest;
import com.apiaura.apiaura.engine.ai.dto.request.SendMessageRequest;
import com.apiaura.apiaura.engine.ai.dto.response.AiActionResponse;
import com.apiaura.apiaura.engine.ai.dto.response.ChatMessageResponse;
import com.apiaura.apiaura.engine.ai.dto.response.ChatSessionResponse;
import com.apiaura.apiaura.engine.ai.service.AiActionService;
import com.apiaura.apiaura.engine.ai.service.AiChatService;
import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
public class AiChatController {

    private final AiChatService aiChatService;

    private final AiActionService aiActionService;

    public AiChatController(
            AiChatService aiChatService,
            AiActionService aiActionService
    ) {
        this.aiChatService =
                aiChatService;

        this.aiActionService =
                aiActionService;
    }

    @PostMapping(
            "/workspaces/{workspaceId}/sessions"
    )
    public ApiResponse<ChatSessionResponse>
    createSession(
            @PathVariable UUID workspaceId,

            @Valid
            @RequestBody
            CreateChatSessionRequest request
    ) {

        return ApiResponse.success(
                "AI chat session created",
                aiChatService.createSession(
                        workspaceId,
                        request
                )
        );
    }

    @GetMapping(
            "/sessions/{sessionId}"
    )
    public ApiResponse<ChatSessionResponse>
    getSession(
            @PathVariable UUID sessionId
    ) {

        return ApiResponse.success(
                "AI session retrieved",
                aiChatService.getSession(
                        sessionId
                )
        );
    }

    @PostMapping(
            "/sessions/{sessionId}/messages"
    )
    public ApiResponse<ChatMessageResponse>
    sendMessage(
            @PathVariable UUID sessionId,

            @Valid
            @RequestBody
            SendMessageRequest request
    ) {

        return ApiResponse.success(
                "Message processed",
                aiChatService.sendMessage(
                        sessionId,
                        request
                )
        );
    }

    @GetMapping(
            "/sessions/{sessionId}/actions"
    )
    public ApiResponse<List<AiActionResponse>>
    getActions(
            @PathVariable UUID sessionId
    ) {

        return ApiResponse.success(
                "AI actions retrieved",
                aiActionService.getSessionActions(
                        sessionId
                )
        );
    }

    @PostMapping(
            "/actions/{actionId}/confirm"
    )
    public ApiResponse<AiActionResponse>
    confirmAction(
            @PathVariable UUID actionId
    ) {

        return ApiResponse.success(
                "AI action confirmed",
                aiActionService.confirm(
                        actionId
                )
        );
    }

    @PostMapping(
            "/actions/{actionId}/reject"
    )
    public ApiResponse<AiActionResponse>
    rejectAction(
            @PathVariable UUID actionId
    ) {

        return ApiResponse.success(
                "AI action rejected",
                aiActionService.reject(
                        actionId
                )
        );
    }
}
