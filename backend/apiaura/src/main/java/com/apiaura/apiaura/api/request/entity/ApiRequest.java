package com.apiaura.apiaura.api.request.entity;

import com.apiaura.apiaura.api.collection.entity.Collection;
import com.apiaura.apiaura.api.collection.entity.CollectionFolder;
import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.foundation.common.enums.BodyType;
import com.apiaura.apiaura.foundation.common.enums.HttpMethod;
import com.apiaura.apiaura.engine.scripting.entity.PostRequestScript;
import com.apiaura.apiaura.engine.scripting.entity.PreRequestScript;
import com.apiaura.apiaura.identity.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "api_requests",
        indexes = {
                @Index(name = "idx_api_request_collection_id", columnList = "collection_id"),
                @Index(name = "idx_api_request_folder_id", columnList = "folder_id"),
                @Index(name = "idx_api_request_parent_id", columnList = "parent_request_id"),
                @Index(name = "idx_api_request_created_by", columnList = "created_by")
        }
)
public class ApiRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "collection_id", nullable = false)
    private Collection collection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private CollectionFolder folder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_request_id")
    private ApiRequest parentRequest;

    @OneToMany(mappedBy = "parentRequest")
    private List<ApiRequest> childRequests = new ArrayList<>();

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private HttpMethod method;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String documentation;

    @Column(name = "body_type", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private BodyType bodyType = BodyType.NONE;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    private boolean enabled = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(
            mappedBy = "request",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("sortOrder ASC")
    private List<RequestHeader> headers = new ArrayList<>();

    @OneToMany(
            mappedBy = "request",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("sortOrder ASC")
    private List<QueryParameter> queryParameters = new ArrayList<>();

    @OneToMany(
            mappedBy = "request",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("sortOrder ASC")
    private List<PathParameter> pathParameters = new ArrayList<>();

    @OneToOne(
            mappedBy = "request",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private RequestAuth auth;

    @OneToOne(
            mappedBy = "request",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private PreRequestScript preRequestScript;

    @OneToOne(
            mappedBy = "request",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private PostRequestScript postRequestScript;
}