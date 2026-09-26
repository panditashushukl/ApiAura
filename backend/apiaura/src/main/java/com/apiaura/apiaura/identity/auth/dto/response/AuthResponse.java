package com.apiaura.apiaura.identity.auth.dto.response;

import com.apiaura.apiaura.identity.user.dto.response.UserResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String accessToken;

    private String refreshToken;

    private long expiresIn;

    private UserResponse user;
}
