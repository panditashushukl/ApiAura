package com.apiaura.apiaura.org.workspace.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.org.workspace.dto.request.CreateWorkspaceRequest;
import com.apiaura.apiaura.org.workspace.dto.request.UpdateWorkspaceRequest;
import com.apiaura.apiaura.org.workspace.dto.response.WorkspaceResponse;
import com.apiaura.apiaura.org.workspace.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping
    public ApiResponse<List<WorkspaceResponse>> getMine() {

        return ApiResponse.success(
                workspaceService.getByUser(
                        SecurityUtils.getCurrentUserId()
                )
        );
    }

    @GetMapping("/{workspaceId}")
    public ApiResponse<WorkspaceResponse> getById(
            @PathVariable UUID workspaceId
    ) {
        return ApiResponse.success(
                workspaceService.getById(workspaceId)
        );
    }

    @GetMapping("/organization/{organizationId}")
    public ApiResponse<List<WorkspaceResponse>>
    getByOrganization(
            @PathVariable UUID organizationId
    ) {
        return ApiResponse.success(
                workspaceService.getByOrganization(
                        organizationId
                )
        );
    }

    @PostMapping("/organization/{organizationId}")
    public ApiResponse<WorkspaceResponse> create(
            @PathVariable UUID organizationId,
            @Valid @RequestBody CreateWorkspaceRequest request
    ) {

        return ApiResponse.success(
                "Workspace created",
                workspaceService.create(
                        organizationId,
                        SecurityUtils.getCurrentUserId(),
                        request
                )
        );
    }

    @PatchMapping("/{workspaceId}")
    public ApiResponse<WorkspaceResponse> update(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody UpdateWorkspaceRequest request
    ) {

        return ApiResponse.success(
                "Workspace updated",
                workspaceService.update(
                        workspaceId,
                        request
                )
        );
    }

    @DeleteMapping("/{workspaceId}")
    public ApiResponse<Void> delete(
            @PathVariable UUID workspaceId
    ) {

        workspaceService.delete(workspaceId);

        return ApiResponse.success(
                "Workspace deleted"
        );
    }
}
