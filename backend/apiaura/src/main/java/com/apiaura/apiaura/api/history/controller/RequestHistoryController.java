package com.apiaura.apiaura.api.history.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.response.PageResponse;
import com.apiaura.apiaura.execution.enums.ExecutionStatus;
import com.apiaura.apiaura.api.history.dto.response.RequestHistoryDetailResponse;
import com.apiaura.apiaura.api.history.dto.response.RequestHistoryResponse;
import com.apiaura.apiaura.api.history.service.RequestHistoryService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/history")
public class RequestHistoryController {

    private final RequestHistoryService historyService;

    public RequestHistoryController(
            RequestHistoryService historyService
    ) {
        this.historyService =
                historyService;
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<PageResponse<RequestHistoryResponse>>
            > getMyHistory(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size

    ) {

        Pageable pageable =
                createPageable(page, size);

        PageResponse<RequestHistoryResponse> response =
                historyService.getMyHistory(
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Request history retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<
            ApiResponse<PageResponse<RequestHistoryResponse>>
            > getRequestHistory(

            @PathVariable UUID requestId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size

    ) {

        Pageable pageable =
                createPageable(page, size);

        PageResponse<RequestHistoryResponse> response =
                historyService.getRequestHistory(
                        requestId,
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Request history retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<
            ApiResponse<PageResponse<RequestHistoryResponse>>
            > getByStatus(

            @PathVariable ExecutionStatus status,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size

    ) {

        Pageable pageable =
                createPageable(page, size);

        PageResponse<RequestHistoryResponse> response =
                historyService.getHistoryByStatus(
                        status,
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Request history retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/{executionId}")
    public ResponseEntity<
            ApiResponse<RequestHistoryDetailResponse>
            > getExecution(

            @PathVariable UUID executionId

    ) {

        RequestHistoryDetailResponse response =
                historyService.getExecution(
                        executionId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Execution retrieved successfully",
                        response
                )
        );
    }

    @DeleteMapping("/{executionId}")
    public ResponseEntity<
            ApiResponse<Void>
            > deleteExecution(

            @PathVariable UUID executionId

    ) {

        historyService.deleteExecution(
                executionId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Execution deleted successfully",
                        null
                )
        );
    }

    private Pageable createPageable(
            int page,
            int size
    ) {

        if (page < 0) {
            page = 0;
        }

        if (size < 1) {
            size = 20;
        }

        /*
         * Prevent excessively large history requests.
         */
        size = Math.min(size, 100);

        return PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );
    }
}
