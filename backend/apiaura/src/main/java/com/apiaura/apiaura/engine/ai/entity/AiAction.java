package com.apiaura.apiaura.engine.ai.entity;

import com.apiaura.apiaura.ai.enums.AiActionRisk;
import com.apiaura.apiaura.ai.enums.AiActionStatus;
import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "ai_actions",
    indexes = {
        @Index(name = "idx_ai_action_session", columnList = "session_id"),
        @Index(name = "idx_ai_action_message", columnList = "message_id"),
        @Index(name = "idx_ai_action_status", columnList = "status")
    }
)
public class AiAction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private AiChatSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private AiMessage message;

    @Column(nullable = false, length = 100)
    private String toolName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AiActionRisk risk;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AiActionStatus status;

    @Column(columnDefinition = "TEXT")
    private String inputJson;

    @Column(columnDefinition = "TEXT")
    private String outputJson;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
    private boolean confirmationRequired;

    @Column(nullable = false)
    private boolean confirmed;
}
