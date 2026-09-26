package com.apiaura.apiaura.engine.ai.repository;

import com.apiaura.apiaura.engine.ai.entity.AiAction;
import com.apiaura.apiaura.ai.enums.AiActionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AiActionRepository
        extends JpaRepository<AiAction, UUID> {

    List<AiAction> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);

    List<AiAction> findByStatus(AiActionStatus status);
}
