package com.apiaura.apiaura.engine.ai.entity;

import com.apiaura.apiaura.ai.enums.AiMessageRole;
import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "ai_messages",
    indexes = {
        @Index(name = "idx_ai_message_session", columnList = "session_id")
    }
)
public class AiMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private AiChatSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AiMessageRole role;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
}
