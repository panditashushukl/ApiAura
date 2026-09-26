package com.apiaura.apiaura.engine.scripting.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.api.request.entity.ApiRequest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "pre_request_scripts",
        indexes = {
                @Index(
                        name = "idx_pre_script_request",
                        columnList = "request_id"
                )
        }
)
public class PreRequestScript extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(
            name = "request_id",
            nullable = false
    )
    private ApiRequest request;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String script;
}