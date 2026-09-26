package com.apiaura.apiaura.org.workspace.service;

import com.apiaura.apiaura.org.workspace.entity.WorkspaceMember;

import java.util.List;
import java.util.UUID;

public interface WorkspaceMemberService {

    WorkspaceMember addMember(
            UUID workspaceId,
            UUID userId,
            UUID invitedBy
    );

    List<WorkspaceMember> getMembers(
            UUID workspaceId
    );

    WorkspaceMember getMember(
            UUID workspaceId,
            UUID userId
    );

    void removeMember(
            UUID workspaceId,
            UUID userId
    );
}
