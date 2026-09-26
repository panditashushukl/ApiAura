package com.apiaura.apiaura.engine.execution.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.foundation.common.enums.ExecutionStatus;
import com.apiaura.apiaura.api.environment.entity.Environment;
import com.apiaura.apiaura.api.request.entity.ApiRequest;
import com.apiaura.apiaura.identity.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "request_executions",
        indexes = {
                @Index(name = "idx_execution_request", columnList = "request_id"),
                @Index(name = "idx_execution_environment", columnList = "environment_id"),
                @Index(name = "idx_execution_user", columnList = "executed_by"),
                @Index(name = "idx_execution_created_at", columnList = "created_at")
        }
)
public class RequestExecution extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "request_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_execution_request")
    )
    private ApiRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "environment_id",
            foreignKey = @ForeignKey(name = "fk_execution_environment")
    )
    private Environment environment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "executed_by",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_execution_user")
    )
    private User executedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExecutionStatus status;

    @Column(nullable = false, length = 10)
    private String method;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String resolvedUrl;

    @Column(columnDefinition = "TEXT")
    private String requestHeaders;

    @Column(columnDefinition = "TEXT")
    private String requestBody;

    @Column
    private Integer responseStatus;

    @Column(columnDefinition = "TEXT")
    private String responseHeaders;

    @Column(columnDefinition = "TEXT")
    private String responseBody;

    @Column
    private Long durationMs;

    @Column
    private Long responseSizeBytes;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}