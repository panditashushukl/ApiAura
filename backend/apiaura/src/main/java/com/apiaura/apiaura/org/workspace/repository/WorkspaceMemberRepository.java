package com.apiaura.apiaura.org.workspace.repository;

import com.apiaura.apiaura.org.workspace.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceMemberRepository
        extends JpaRepository<WorkspaceMember, UUID> {

    List<WorkspaceMember> findByWorkspaceId(UUID workspaceId);

    List<WorkspaceMember> findByUserId(UUID userId);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(
            UUID workspaceId,
            UUID userId
    );

    boolean existsByWorkspaceIdAndUserId(
            UUID workspaceId,
            UUID userId
    );

    void deleteByWorkspaceIdAndUserId(
            UUID workspaceId,
            UUID userId
    );

    long countByWorkspaceId(UUID workspaceId);
}
