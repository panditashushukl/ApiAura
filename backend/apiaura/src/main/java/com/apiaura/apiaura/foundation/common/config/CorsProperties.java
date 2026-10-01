package com.apiaura.apiaura.foundation.common.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "security.cors")
public class CorsProperties {

    private String allowedOrigins;
}