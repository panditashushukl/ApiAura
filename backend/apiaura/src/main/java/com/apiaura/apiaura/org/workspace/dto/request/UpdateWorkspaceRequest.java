package com.apiaura.apiaura.org.workspace.dto.request;

import com.apiaura.apiaura.foundation.common.enums.WorkspaceStatus;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateWorkspaceRequest {

    @Size(min = 2, max = 150)
    private String name;

    @Size(min = 2, max = 100)
    private String slug;

    @Size(max = 1000)
    private String description;

    private WorkspaceStatus status;
}
