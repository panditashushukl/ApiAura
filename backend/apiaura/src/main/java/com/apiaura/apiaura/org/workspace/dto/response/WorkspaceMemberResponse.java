package com.apiaura.apiaura.org.workspace.dto.response;

import com.apiaura.apiaura.org.workspace.entity.WorkspaceMember;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class WorkspaceMemberResponse {

    private UUID id;
    private UUID workspaceId;
    private UUID userId;
    private String status;
    private UUID invitedBy;
    private Instant joinedAt;

    public static WorkspaceMemberResponse from(
            WorkspaceMember member
    ) {
        return WorkspaceMemberResponse.builder()
                .id(member.getId())
                .workspaceId(
                        member.getWorkspace().getId()
                )
                .userId(
                        member.getUser().getId()
                )
                .status(member.getStatus())
                .invitedBy(
                        member.getInvitedBy() != null
                                ? member.getInvitedBy().getId()
                                : null
                )
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
