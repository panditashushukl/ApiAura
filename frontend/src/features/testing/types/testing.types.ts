export type AssertionType =
  | "STATUS_CODE_EQUALS"
  | "RESPONSE_TIME_LESS_THAN"
  | "BODY_CONTAINS"
  | "BODY_NOT_CONTAINS"
  | "HEADER_EXISTS"
  | "HEADER_EQUALS"
  | "JSON_PATH_EXISTS"
  | "JSON_PATH_EQUALS"
  | "JSON_PATH_CONTAINS";

export type TestExecutionStatus = "PASSED" | "FAILED" | "ERROR";

export interface TestAssertion {
  id: string;
  assertionType: AssertionType;
  target?: string;
  expectedValue?: string;
  enabled: boolean;
}

export interface AssertionResult {
  assertion: TestAssertion;
  passed: boolean;
  actualValue?: string;
  message: string;
}

export interface ApiTest {
  id: string;
  name: string;
  requestId?: string;
  assertions: TestAssertion[];
}

export interface TestSuite {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestExecutionResponse {
  id: string;
  testSuiteId: string;
  requestExecutionId?: string | null;
  status: TestExecutionStatus;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs: number;
  createdAt: string;
}
