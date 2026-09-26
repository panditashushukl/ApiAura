package com.apiaura.apiaura.org.workspace.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.org.workspace.dto.response.WorkspaceMemberResponse;
import com.apiaura.apiaura.org.workspace.service.WorkspaceMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/members")
@RequiredArgsConstructor
public class WorkspaceMemberController {

    private final WorkspaceMemberService memberService;

    @GetMapping
    public ApiResponse<List<WorkspaceMemberResponse>> getMembers(
            @PathVariable UUID workspaceId
    ) {

        return ApiResponse.success(
                memberService.getMembers(workspaceId)
                        .stream()
                        .map(WorkspaceMemberResponse::from)
                        .toList()
        );
    }

    @GetMapping("/{userId}")
    public ApiResponse<WorkspaceMemberResponse> getMember(
            @PathVariable UUID workspaceId,
            @PathVariable UUID userId
    ) {

        return ApiResponse.success(
                WorkspaceMemberResponse.from(
                        memberService.getMember(
                                workspaceId,
                                userId
                        )
                )
        );
    }

    @PostMapping("/{userId}")
    public ApiResponse<WorkspaceMemberResponse> addMember(
            @PathVariable UUID workspaceId,
            @PathVariable UUID userId
    ) {

        return ApiResponse.success(
                "Member added",
                WorkspaceMemberResponse.from(
                        memberService.addMember(
                                workspaceId,
                                userId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<Void> removeMember(
            @PathVariable UUID workspaceId,
            @PathVariable UUID userId
    ) {

        memberService.removeMember(
                workspaceId,
                userId
        );

        return ApiResponse.success(
                "Member removed"
        );
    }
}
