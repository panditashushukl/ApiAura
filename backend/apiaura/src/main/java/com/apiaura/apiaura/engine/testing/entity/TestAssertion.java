package com.apiaura.apiaura.engine.testing.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.engine.testing.enums.AssertionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "test_assertions",
        indexes = {
                @Index(
                        name = "idx_test_assertion_test",
                        columnList = "api_test_id"
                )
        }
)
public class TestAssertion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "api_test_id",
            nullable = false
    )
    private ApiTest apiTest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AssertionType assertionType;

    /**
     * Target used by assertions.
     *
     * Examples:
     *
     * JSON_PATH_EQUALS -> $.data.id
     * HEADER_EXISTS    -> Authorization
     * BODY_CONTAINS    -> success
     */
    @Column(length = 500)
    private String target;

    /**
     * Expected value.
     */
    @Column(columnDefinition = "TEXT")
    private String expectedValue;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private int sortOrder = 0;
}