package com.apiaura.apiaura.engine.testing.service;

import com.apiaura.apiaura.engine.testing.entity.*;
import com.apiaura.apiaura.engine.testing.enums.TestResultStatus;
import com.apiaura.apiaura.engine.testing.repository.TestExecutionRepository;
import com.apiaura.apiaura.engine.testing.repository.TestResultRepository;
import com.apiaura.apiaura.engine.testing.repository.TestSuiteRepository;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.engine.execution.repository.RequestExecutionRepository;
import com.apiaura.apiaura.engine.testing.dto.request.ExecuteTestSuiteRequest;
import com.apiaura.apiaura.engine.testing.dto.response.TestExecutionResponse;
import com.apiaura.apiaura.testing.entity.*;
import com.apiaura.apiaura.testing.enums.*;
import com.apiaura.apiaura.testing.repository.*;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class TestingServiceImpl implements TestingService {

    private final TestSuiteRepository testSuiteRepository;
    private final TestExecutionRepository testExecutionRepository;
    private final TestResultRepository testResultRepository;
    private final RequestExecutionRepository requestExecutionRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ObjectMapper objectMapper;

    public TestingServiceImpl(
            TestSuiteRepository testSuiteRepository,
            TestExecutionRepository testExecutionRepository,
            TestResultRepository testResultRepository,
            RequestExecutionRepository requestExecutionRepository,
            UserRepository userRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            ObjectMapper objectMapper
    ) {
        this.testSuiteRepository = testSuiteRepository;
        this.testExecutionRepository = testExecutionRepository;
        this.testResultRepository = testResultRepository;
        this.requestExecutionRepository = requestExecutionRepository;
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public TestExecutionResponse executeTestSuite(
            UUID testSuiteId,
            ExecuteTestSuiteRequest request
    ) {

        UUID userId =
                SecurityUtils.getCurrentUserId();

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        TestSuite testSuite =
                testSuiteRepository.findById(testSuiteId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Test suite not found"
                                )
                        );

        UUID workspaceId =
                testSuite
                        .getCollection()
                        .getWorkspace()
                        .getId();

        validateWorkspaceAccess(
                workspaceId,
                userId
        );

        if (!testSuite.isEnabled()) {
            throw new BadRequestException(
                    "Test suite is disabled"
            );
        }

        RequestExecution requestExecution =
                requestExecutionRepository.findById(
                        request.requestExecutionId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Request execution not found"
                        )
                );

        validateRequestExecution(
                testSuite,
                requestExecution
        );

        Instant start = Instant.now();

        TestExecution testExecution =
                new TestExecution();

        testExecution.setTestSuite(testSuite);
        testExecution.setRequestExecution(
                requestExecution
        );
        testExecution.setEnvironment(
                requestExecution.getEnvironment()
        );
        testExecution.setExecutedBy(user);

        int total = 0;
        int passed = 0;
        int failed = 0;

        for (ApiTest apiTest :
                testSuite.getTests()) {

            if (!apiTest.isEnabled()) {
                continue;
            }

            for (TestAssertion assertion :
                    apiTest.getAssertions()) {

                if (!assertion.isEnabled()) {
                    continue;
                }

                total++;

                Instant assertionStart =
                        Instant.now();

                TestResult result =
                        evaluateAssertion(
                                assertion,
                                requestExecution
                        );

                result.setTestExecution(
                        testExecution
                );

                result.setDurationMs(
                        Duration.between(
                                assertionStart,
                                Instant.now()
                        ).toMillis()
                );

                if (result.getStatus()
                        == TestResultStatus.PASSED) {

                    passed++;

                } else {

                    failed++;
                }

                testExecution
                        .getResults()
                        .add(result);
            }
        }

        testExecution.setTotalTests(total);
        testExecution.setPassedTests(passed);
        testExecution.setFailedTests(failed);

        testExecution.setStatus(
                failed == 0
                        ? TestExecutionStatus.PASSED
                        : TestExecutionStatus.FAILED
        );

        testExecution.setDurationMs(
                Duration.between(
                        start,
                        Instant.now()
                ).toMillis()
        );

        TestExecution saved =
                testExecutionRepository.save(
                        testExecution
                );

        return TestExecutionResponse.from(saved);
    }

    private TestResult evaluateAssertion(
            TestAssertion assertion,
            RequestExecution execution
    ) {

        try {

            return switch (
                    assertion.getAssertionType()
            ) {

                case STATUS_CODE_EQUALS ->
                        statusCodeEquals(
                                assertion,
                                execution
                        );

                case RESPONSE_TIME_LESS_THAN ->
                        responseTimeLessThan(
                                assertion,
                                execution
                        );

                case BODY_CONTAINS ->
                        bodyContains(
                                assertion,
                                execution,
                                false
                        );

                case BODY_NOT_CONTAINS ->
                        bodyContains(
                                assertion,
                                execution,
                                true
                        );

                case HEADER_EXISTS ->
                        headerExists(
                                assertion,
                                execution
                        );

                case HEADER_EQUALS ->
                        headerEquals(
                                assertion,
                                execution
                        );

                case JSON_PATH_EXISTS ->
                        jsonPathExists(
                                assertion,
                                execution
                        );

                case JSON_PATH_EQUALS ->
                        jsonPathEquals(
                                assertion,
                                execution
                        );

                case JSON_PATH_CONTAINS ->
                        jsonPathContains(
                                assertion,
                                execution
                        );
            };

        } catch (Exception exception) {

            return result(
                    assertion,
                    TestResultStatus.ERROR,
                    null,
                    assertion.getExpectedValue(),
                    exception.getMessage()
            );
        }
    }

    private TestResult statusCodeEquals(
            TestAssertion assertion,
            RequestExecution execution
    ) {

        String actual =
                String.valueOf(
                        execution.getResponseStatus()
                );

        boolean passed =
                actual.equals(
                        assertion.getExpectedValue()
                );

        return result(
                assertion,
                passed
                        ? TestResultStatus.PASSED
                        : TestResultStatus.FAILED,
                actual,
                assertion.getExpectedValue(),
                passed
                        ? "Status code assertion passed"
                        : "Expected status code "
                        + assertion.getExpectedValue()
                        + " but received "
                        + actual
        );
    }

    private TestResult responseTimeLessThan(
            TestAssertion assertion,
            RequestExecution execution
    ) {

        long actual =
                execution.getDurationMs() == null
                        ? 0
                        : execution.getDurationMs();

        long expected =
                Long.parseLong(
                        assertion.getExpectedValue()
                );

        boolean passed =
                actual < expected;

        return result(
                assertion,
                passed
                        ? TestResultStatus.PASSED
                        : TestResultStatus.FAILED,
                String.valueOf(actual),
                String.valueOf(expected),
                passed
                        ? "Response time assertion passed"
                        : "Response took "
                        + actual
                        + "ms; expected less than "
                        + expected
                        + "ms"
        );
    }

    private TestResult bodyContains(
            TestAssertion assertion,
            RequestExecution execution,
            boolean negate
    ) {

        String body =
                execution.getResponseBody();

        String expected =
                assertion.getExpectedValue();

        boolean contains =
                body != null &&
                        expected != null &&
                        body.contains(expected);

        boolean passed =
                negate
                        ? !contains
                        : contains;

        return result(
                assertion,
                passed
                        ? TestResultStatus.PASSED
                        : TestResultStatus.FAILED,
                body,
                expected,
                passed
                        ? "Body assertion passed"
                        : "Body assertion failed"
        );
    }

    private TestResult headerExists(
            TestAssertion assertion,
            RequestExecution execution
    ) {

        Map<String, Object> headers =
                parseHeaders(execution);

        String target =
                assertion.getTarget();

        Object actual =
                findHeader(
                        headers,
                        target
                );

        boolean passed =
                actual != null;

        return result(
                assertion,
                passed
                        ? TestResultStatus.PASSED
                        : TestResultStatus.FAILED,
                actual == null
                        ? null
                        : actual.toString(),
                "exists",
                passed
                        ? "Header exists"
                        : "Header does not exist"
        );
    }

    private TestResult headerEquals(
            TestAssertion assertion,
            RequestExecution execution
    ) {

        Map<String, Object> headers =
                parseHeaders(execution);

        Object actual =
                findHeader(
                        headers,
                        assertion.getTarget()
                );

        String actualValue =
                actual == null
                        ? null
                        : actual.toString();

        boolean passed =
                actualValue != null &&
                        actualValue.equals(
                                assertion.getExpectedValue()
                        );

        return result(
                assertion,
                passed
                        ? TestResultStatus.PASSED
                        : TestResultStatus.FAILED,
                actualValue,
                assertion.getExpectedValue(),
                passed
                        ? "Header assertion passed"
                        : "Header value does not match"
        );
    }

    private TestResult jsonPathExists(
            TestAssertion assertion,
            RequestExecution execution
    ) {

        JsonNode node =
                resolveJsonPath(
                        execution.getResponseBody(),
                        assertion.getTarget()
                );

        boolean passed =
                node != null &&
                        !node.isMissingNode();

        return result(
                assertion,
                passed
                        ? TestResultStatus.PASSED
                        : TestResultStatus.FAILED,
                node == null
                        ? null
                        : node.toString(),
                "exists",
                passed
                        ? "JSON path exists"
                        : "JSON path does not exist"
        );
    }

    private TestResult jsonPathEquals(
            TestAssertion assertion,
            RequestExecution execution
    ) {

        JsonNode node =
                resolveJsonPath(
                        execution.getResponseBody(),
                        assertion.getTarget()
                );

        String actual =
                node == null ||
                        node.isMissingNode()
                        ? null
                        : node.isTextual()
                                ? node.asText()
                                : node.toString();

        boolean passed =
                actual != null &&
                        actual.equals(
                                assertion.getExpectedValue()
                        );

        return result(
                assertion,
                passed
                        ? TestResultStatus.PASSED
                        : TestResultStatus.FAILED,
                actual,
                assertion.getExpectedValue(),
                passed
                        ? "JSON path value matches"
                        : "JSON path value does not match"
        );
    }

    private TestResult jsonPathContains(
            TestAssertion assertion,
            RequestExecution execution
    ) {

        JsonNode node =
                resolveJsonPath(
                        execution.getResponseBody(),
                        assertion.getTarget()
                );

        String actual =
                node == null ||
                        node.isMissingNode()
                        ? null
                        : node.isTextual()
                                ? node.asText()
                                : node.toString();

        boolean passed =
                actual != null &&
                        assertion.getExpectedValue() != null &&
                        actual.contains(
                                assertion.getExpectedValue()
                        );

        return result(
                assertion,
                passed
                        ? TestResultStatus.PASSED
                        : TestResultStatus.FAILED,
                actual,
                assertion.getExpectedValue(),
                passed
                        ? "JSON path contains expected value"
                        : "JSON path does not contain expected value"
        );
    }

    private JsonNode resolveJsonPath(
            String body,
            String path
    ) {

        if (body == null ||
                body.isBlank() ||
                path == null ||
                path.isBlank()) {

            return null;
        }

        try {

            JsonNode current =
                    objectMapper.readTree(body);

            String normalized =
                    path.trim();

            if (normalized.startsWith("$.")) {
                normalized =
                        normalized.substring(2);
            } else if (normalized.startsWith("$")) {
                normalized =
                        normalized.substring(1);
            }

            if (normalized.isBlank()) {
                return current;
            }

            String[] parts =
                    normalized.split("\\.");

            for (String part : parts) {

                if (part.isBlank()) {
                    continue;
                }

                if (current == null ||
                        current.isNull()) {

                    return null;
                }

                if (part.matches("\\d+")) {

                    if (!current.isArray()) {
                        return null;
                    }

                    int index =
                            Integer.parseInt(part);

                    if (index >= current.size()) {
                        return null;
                    }

                    current =
                            current.get(index);

                } else {

                    current =
                            current.get(part);

                    if (current == null) {
                        return null;
                    }
                }
            }

            return current;

        } catch (Exception exception) {

            throw new BadRequestException(
                    "Response body is not valid JSON"
            );
        }
    }

    private Map<String, Object> parseHeaders(
            RequestExecution execution
    ) {

        if (execution.getResponseHeaders() == null) {
            return Map.of();
        }

        try {

            return objectMapper.readValue(
                    execution.getResponseHeaders(),
                    Map.class
            );

        } catch (Exception exception) {

            throw new BadRequestException(
                    "Unable to parse response headers"
            );
        }
    }

    private Object findHeader(
            Map<String, Object> headers,
            String name
    ) {

        if (name == null) {
            return null;
        }

        for (Map.Entry<String, Object> entry :
                headers.entrySet()) {

            if (entry.getKey()
                    .equalsIgnoreCase(name)) {

                return entry.getValue();
            }
        }

        return null;
    }

    private TestResult result(
            TestAssertion assertion,
            TestResultStatus status,
            String actual,
            String expected,
            String message
    ) {

        TestResult result =
                new TestResult();

        result.setAssertion(assertion);
        result.setStatus(status);
        result.setActualValue(actual);
        result.setExpectedValue(expected);
        result.setMessage(message);

        return result;
    }

    private void validateRequestExecution(
            TestSuite testSuite,
            RequestExecution execution
    ) {

        UUID suiteCollectionId =
                testSuite
                        .getCollection()
                        .getId();

        UUID requestCollectionId =
                execution
                        .getRequest()
                        .getCollection()
                        .getId();

        if (!suiteCollectionId.equals(
                requestCollectionId
        )) {

            throw new BadRequestException(
                    "Request execution does not belong to this collection"
            );
        }
    }

    private void validateWorkspaceAccess(
            UUID workspaceId,
            UUID userId
    ) {

        boolean member =
                workspaceMemberRepository
                        .existsByWorkspaceIdAndUserIdAndStatus(
                                workspaceId,
                                userId,
                                "ACTIVE"
                        );

        if (!member) {
            throw new ForbiddenException(
                    "You do not have access to this workspace"
            );
        }
    }
}
