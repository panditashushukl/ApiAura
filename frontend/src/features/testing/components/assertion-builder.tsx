"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/feedback/toast-system";
import type { ApiExecutionResponse } from "@/features/execution/types/execution.types";
import type { AssertionResult, TestAssertion, AssertionType } from "../types/testing.types";

interface AssertionBuilderProps {
  assertions: TestAssertion[];
  onChangeAssertions: (assertions: TestAssertion[]) => void;
  lastExecution?: ApiExecutionResponse | null;
}

export function AssertionBuilder({
  assertions,
  onChangeAssertions,
  lastExecution,
}: AssertionBuilderProps) {
  const toast = useToast();

  const [assertionType, setAssertionType] = useState<AssertionType>("STATUS_CODE_EQUALS");
  const [target, setTarget] = useState("");
  const [expectedValue, setExpectedValue] = useState("200");

  const handleAddAssertion = (e: React.FormEvent) => {
    e.preventDefault();

    const newAssertion: TestAssertion = {
      id: "assert_" + Date.now(),
      assertionType,
      target: target.trim() || undefined,
      expectedValue: expectedValue.trim() || undefined,
      enabled: true,
    };

    onChangeAssertions([...assertions, newAssertion]);
    toast.success("Assertion added");
    setTarget("");
  };

  const handleRemove = (id: string) => {
    onChangeAssertions(assertions.filter((a) => a.id !== id));
  };

  const handleToggle = (id: string) => {
    onChangeAssertions(
      assertions.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  // Helper to parse response headers JSON string or object
  const parseHeaders = (rawHeaders?: string | null): Record<string, string> => {
    if (!rawHeaders) return {};
    try {
      return JSON.parse(rawHeaders);
    } catch {
      return {};
    }
  };

  // Evaluate assertions against lastExecution if present
  const evaluateAssertion = (assertion: TestAssertion): AssertionResult => {
    if (!lastExecution) {
      return {
        assertion,
        passed: false,
        message: "No execution data available yet",
      };
    }

    const { responseStatus, durationMs, responseBody, responseHeaders: rawHeaders } = lastExecution;
    const statusCode = responseStatus || 0;
    const responseTime = durationMs || 0;
    const headers = parseHeaders(rawHeaders);

    switch (assertion.assertionType) {
      case "STATUS_CODE_EQUALS": {
        const expected = Number(assertion.expectedValue || 200);
        const passed = statusCode === expected;
        return {
          assertion,
          passed,
          actualValue: String(statusCode),
          message: passed
            ? `Status code is ${statusCode}`
            : `Expected status ${expected} but got ${statusCode}`,
        };
      }

      case "RESPONSE_TIME_LESS_THAN": {
        const expected = Number(assertion.expectedValue || 1000);
        const passed = responseTime < expected;
        return {
          assertion,
          passed,
          actualValue: `${responseTime}ms`,
          message: passed
            ? `Response time ${responseTime}ms < ${expected}ms`
            : `Response time ${responseTime}ms exceeded ${expected}ms`,
        };
      }

      case "BODY_CONTAINS": {
        const expected = assertion.expectedValue || "";
        const passed = Boolean(responseBody?.includes(expected));
        return {
          assertion,
          passed,
          message: passed
            ? `Body contains "${expected}"`
            : `Body does not contain "${expected}"`,
        };
      }

      case "BODY_NOT_CONTAINS": {
        const expected = assertion.expectedValue || "";
        const passed = !responseBody?.includes(expected);
        return {
          assertion,
          passed,
          message: passed
            ? `Body does not contain "${expected}"`
            : `Body unexpectedly contains "${expected}"`,
        };
      }

      case "HEADER_EXISTS": {
        const key = (assertion.target || "").toLowerCase();
        const exists = Object.keys(headers).some((h) => h.toLowerCase() === key);
        return {
          assertion,
          passed: exists,
          message: exists ? `Header "${assertion.target}" exists` : `Header "${assertion.target}" missing`,
        };
      }

      case "HEADER_EQUALS": {
        const key = (assertion.target || "").toLowerCase();
        const headerKey = Object.keys(headers).find((h) => h.toLowerCase() === key);
        const actualVal = headerKey ? headers[headerKey] : null;
        const passed = actualVal === assertion.expectedValue;
        return {
          assertion,
          passed,
          actualValue: actualVal || "undefined",
          message: passed
            ? `Header "${assertion.target}" equals "${assertion.expectedValue}"`
            : `Header "${assertion.target}" expected "${assertion.expectedValue}" but got "${actualVal}"`,
        };
      }

      case "JSON_PATH_EXISTS":
      case "JSON_PATH_EQUALS":
      case "JSON_PATH_CONTAINS": {
        try {
          const parsed = JSON.parse(responseBody || "{}");
          const pathStr = (assertion.target || "").replace(/^\$\./, "");
          const val = pathStr.split(".").reduce<unknown>((obj, key) => {
            if (obj && typeof obj === "object") {
              return (obj as Record<string, unknown>)[key];
            }
            return undefined;
          }, parsed);
          const exists = val !== undefined && val !== null;

          if (assertion.assertionType === "JSON_PATH_EXISTS") {
            return {
              assertion,
              passed: exists,
              actualValue: String(val),
              message: exists ? `JSON path ${assertion.target} exists` : `JSON path ${assertion.target} not found`,
            };
          }

          if (assertion.assertionType === "JSON_PATH_EQUALS") {
            const passed = String(val) === String(assertion.expectedValue);
            return {
              assertion,
              passed,
              actualValue: String(val),
              message: passed
                ? `JSON path ${assertion.target} equals "${assertion.expectedValue}"`
                : `JSON path ${assertion.target} expected "${assertion.expectedValue}" but got "${val}"`,
            };
          }

          const passed = String(val).includes(assertion.expectedValue || "");
          return {
            assertion,
            passed,
            actualValue: String(val),
            message: passed
              ? `JSON path ${assertion.target} contains "${assertion.expectedValue}"`
              : `JSON path ${assertion.target} value "${val}" does not contain "${assertion.expectedValue}"`,
          };
        } catch {
          return {
            assertion,
            passed: false,
            message: "Failed to parse response body as JSON",
          };
        }
      }

      default:
        return { assertion, passed: false, message: "Unknown assertion" };
    }
  };

  const results = assertions.map(evaluateAssertion);
  const passedCount = results.filter((r) => r.assertion.enabled && r.passed).length;
  const totalEnabled = assertions.filter((a) => a.enabled).length;

  return (
    <div className="space-y-4">
      {/* Test Status Banner if last execution available */}
      {lastExecution && assertions.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--muted))/20]">
          <div className="flex items-center gap-2">
            <Badge variant={passedCount === totalEnabled ? "success" : "danger"} className="text-xs">
              {passedCount} / {totalEnabled} Passed
            </Badge>
            <span className="text-xs text-[rgb(var(--muted-foreground))]">
              {passedCount === totalEnabled ? "All active test assertions passed!" : "Some assertions failed."}
            </span>
          </div>
        </div>
      )}

      {/* Assertion Table */}
      <div className="rounded-md border border-[rgb(var(--border))] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))/40]">
              <th className="p-2.5 text-center w-10">Active</th>
              <th className="p-2.5 text-left font-medium">Assertion Rule</th>
              <th className="p-2.5 text-left font-medium">Target / Key</th>
              <th className="p-2.5 text-left font-medium">Expected Value</th>
              {lastExecution && <th className="p-2.5 text-center w-24">Status</th>}
              <th className="p-2.5 text-right w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border))]">
            {assertions.length === 0 ? (
              <tr>
                <td colSpan={lastExecution ? 6 : 5} className="p-4 text-center text-[rgb(var(--muted-foreground))]">
                  No visual assertions defined. Use the form below to add test rules.
                </td>
              </tr>
            ) : (
              assertions.map((a) => {
                const res = lastExecution ? evaluateAssertion(a) : null;
                return (
                  <tr key={a.id} className="hover:bg-[rgb(var(--accent))/30]">
                    <td className="p-2.5 text-center">
                      <Checkbox checked={a.enabled} onCheckedChange={() => handleToggle(a.id)} />
                    </td>
                    <td className="p-2.5 font-mono text-[rgb(var(--primary))] font-semibold">
                      {a.assertionType}
                    </td>
                    <td className="p-2.5 font-mono text-[rgb(var(--muted-foreground))]">
                      {a.target || "N/A"}
                    </td>
                    <td className="p-2.5 font-mono">
                      {a.expectedValue || "N/A"}
                    </td>
                    {lastExecution && (
                      <td className="p-2.5 text-center">
                        {!a.enabled ? (
                          <Badge variant="default" className="text-[10px]">Skipped</Badge>
                        ) : res?.passed ? (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> PASS
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px] gap-1" title={res?.message}>
                            <XCircle className="h-3 w-3" /> FAIL
                          </Badge>
                        )}
                      </td>
                    )}
                    <td className="p-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(a.id)}
                        className="h-7 w-7 p-0 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--danger))]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Assertion Form */}
      <form onSubmit={handleAddAssertion} className="p-3 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--card))] space-y-3">
        <h4 className="text-xs font-semibold flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5 text-[rgb(var(--primary))]" /> Add Test Assertion
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-[rgb(var(--muted-foreground))] block mb-1">Rule Type</label>
            <select
              value={assertionType}
              onChange={(e) => setAssertionType(e.target.value as AssertionType)}
              className="w-full h-8 text-xs px-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--card))]"
            >
              <option value="STATUS_CODE_EQUALS">Status Code Equals</option>
              <option value="RESPONSE_TIME_LESS_THAN">Response Time &lt; (ms)</option>
              <option value="BODY_CONTAINS">Body Contains</option>
              <option value="BODY_NOT_CONTAINS">Body Not Contains</option>
              <option value="HEADER_EXISTS">Header Exists</option>
              <option value="HEADER_EQUALS">Header Equals</option>
              <option value="JSON_PATH_EXISTS">JSON Path Exists</option>
              <option value="JSON_PATH_EQUALS">JSON Path Equals</option>
              <option value="JSON_PATH_CONTAINS">JSON Path Contains</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[rgb(var(--muted-foreground))] block mb-1">Target / Header / Path</label>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. Content-Type or data.token"
              className="h-8 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-[rgb(var(--muted-foreground))] block mb-1">Expected Value</label>
            <Input
              value={expectedValue}
              onChange={(e) => setExpectedValue(e.target.value)}
              placeholder="e.g. 200, 500, application/json"
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Assertion
          </Button>
        </div>
      </form>
    </div>
  );
}
