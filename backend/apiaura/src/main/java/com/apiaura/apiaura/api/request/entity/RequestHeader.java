package com.apiaura.apiaura.api.request.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "request_headers",
        indexes = {
                @Index(name = "idx_request_header_request_id", columnList = "request_id")
        }
)
public class RequestHeader {

    @jakarta.persistence.Id
    @jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private ApiRequest request;

    @Column(name = "header_key", nullable = false, length = 255)
    private String headerKey;

    @Column(name = "header_value", columnDefinition = "TEXT")
    private String headerValue;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private boolean secret = false;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}