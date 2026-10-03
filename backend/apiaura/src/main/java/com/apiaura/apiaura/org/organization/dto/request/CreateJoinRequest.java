package com.apiaura.apiaura.org.organization.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateJoinRequest {

    @Size(max = 500)
    private String message;
}
