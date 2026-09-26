package com.apiaura.apiaura.api.request.entity;

import com.apiaura.apiaura.identity.auth.entity.AuthConfig;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class RequestAuth {

    @Id
    private UUID requestId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "request_id")
    private ApiRequest request;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auth_config_id", nullable = false)
    private AuthConfig authConfig;
}