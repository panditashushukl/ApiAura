package com.apiaura.apiaura.engine.ai.repository;

import com.apiaura.apiaura.engine.ai.entity.AiChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiChatSessionRepository
        extends JpaRepository<AiChatSession, UUID> {

    Page<AiChatSession> findByWorkspaceIdAndUserIdOrderByCreatedAtDesc(
            UUID workspaceId,
            UUID userId,
            Pageable pageable
    );

    Page<AiChatSession> findByWorkspaceIdOrderByCreatedAtDesc(
            UUID workspaceId,
            Pageable pageable
    );
}
