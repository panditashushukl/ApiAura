package com.apiaura.apiaura.api.request.service;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.api.request.dto.request.CreateQueryParameterRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdateQueryParameterRequest;
import com.apiaura.apiaura.api.request.dto.response.QueryParameterResponse;
import com.apiaura.apiaura.api.request.entity.ApiRequest;
import com.apiaura.apiaura.api.request.entity.QueryParameter;
import com.apiaura.apiaura.api.request.repository.ApiRequestRepository;
import com.apiaura.apiaura.api.request.repository.QueryParameterRepository;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import com.apiaura.apiaura.org.workspace.entity.WorkspaceMember;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class QueryParameterServiceImpl implements QueryParameterService {

    private final QueryParameterRepository parameterRepository;
    private final ApiRequestRepository requestRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Override
    @Transactional
    public List<QueryParameterResponse> getByRequest(
            UUID requestId,
            UUID userId
    ) {
        ApiRequest request = getRequest(requestId);

        ensureAccess(request.getCollection().getWorkspace(), userId);

        return parameterRepository
                .findByRequestIdOrderBySortOrderAsc(requestId)
                .stream()
                .map(QueryParameterResponse::from)
                .toList();
    }

    @Override
    public QueryParameterResponse getById(
            UUID requestId,
            UUID parameterId,
            UUID userId
    ) {
        ApiRequest request = getRequest(requestId);

        ensureAccess(request.getCollection().getWorkspace(), userId);

        QueryParameter parameter =
                parameterRepository.findByIdAndRequestId(
                        parameterId,
                        requestId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Query parameter not found"
                        )
                );

        return QueryParameterResponse.from(parameter);
    }

    @Override
    public QueryParameterResponse create(
            UUID requestId,
            UUID userId,
            CreateQueryParameterRequest input
    ) {
        ApiRequest request = getRequest(requestId);

        ensureAccess(request.getCollection().getWorkspace(), userId);

        String key = normalizeRequired(input.paramKey());

        if (parameterRepository.existsByRequestIdAndParamKeyIgnoreCase(
                requestId,
                key
        )) {
            throw new BadRequestException(
                    "This query parameter already exists"
            );
        }

        QueryParameter parameter = new QueryParameter();

        parameter.setRequest(request);
        parameter.setParamKey(key);
        parameter.setParamValue(input.paramValue());
        parameter.setEnabled(
                input.enabled() == null || input.enabled()
        );
        parameter.setSortOrder(
                input.sortOrder() == null
                        ? 0
                        : Math.max(input.sortOrder(), 0)
        );

        return QueryParameterResponse.from(
                parameterRepository.save(parameter)
        );
    }

    @Override
    public QueryParameterResponse update(
            UUID requestId,
            UUID parameterId,
            UUID userId,
            UpdateQueryParameterRequest input
    ) {
        ApiRequest request = getRequest(requestId);

        ensureAccess(request.getCollection().getWorkspace(), userId);

        QueryParameter parameter =
                parameterRepository.findByIdAndRequestId(
                        parameterId,
                        requestId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Query parameter not found"
                        )
                );

        if (input.paramKey() != null) {
            String key = normalizeRequired(input.paramKey());

            if (!key.equalsIgnoreCase(parameter.getParamKey())
                    && parameterRepository
                    .existsByRequestIdAndParamKeyIgnoreCase(
                            requestId,
                            key
                    )) {
                throw new BadRequestException(
                        "This query parameter already exists"
                );
            }

            parameter.setParamKey(key);
        }

        if (input.paramValue() != null) {
            parameter.setParamValue(input.paramValue());
        }

        if (input.enabled() != null) {
            parameter.setEnabled(input.enabled());
        }

        if (input.sortOrder() != null) {
            parameter.setSortOrder(
                    Math.max(input.sortOrder(), 0)
            );
        }

        return QueryParameterResponse.from(
                parameterRepository.save(parameter)
        );
    }

    @Override
    public void delete(
            UUID requestId,
            UUID parameterId,
            UUID userId
    ) {
        ApiRequest request = getRequest(requestId);

        ensureAccess(request.getCollection().getWorkspace(), userId);

        QueryParameter parameter =
                parameterRepository.findByIdAndRequestId(
                        parameterId,
                        requestId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Query parameter not found"
                        )
                );

        parameterRepository.delete(parameter);
    }

    private ApiRequest getRequest(UUID requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "API request not found"
                        )
                );
    }

    private void ensureAccess(
            Workspace workspace,
            UUID userId
    ) {
        if (workspace.getCreatedBy().getId().equals(userId)) {
            return;
        }

        WorkspaceMember member =
                workspaceMemberRepository
                        .findByWorkspaceIdAndUserId(
                                workspace.getId(),
                                userId
                        )
                        .orElseThrow(() ->
                                new ForbiddenException(
                                        "You do not have access to this workspace"
                                )
                        );

        if (!"ACTIVE".equalsIgnoreCase(member.getStatus())) {
            throw new ForbiddenException(
                    "Your workspace membership is not active"
            );
        }
    }

    private String normalizeRequired(String value) {
        if (!StringUtils.hasText(value)) {
            throw new BadRequestException(
                    "Parameter key cannot be blank"
            );
        }

        return value.trim();
    }
}
