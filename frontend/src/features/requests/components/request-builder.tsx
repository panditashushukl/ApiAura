"use client";

import { useState } from "react";
import { Send, Save, Plus, Trash2, ShieldCheck, Code2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useRequestDetail,
  useUpdateRequest,
  useRequestHeaders,
  useCreateRequestHeader,
  useDeleteRequestHeader,
  useQueryParameters,
  useCreateQueryParameter,
  useDeleteQueryParameter,
} from "../hooks/use-requests";
import { useExecuteRequest } from "@/features/execution/hooks/use-execute";
import { ResponseViewer } from "@/features/execution/components/response-viewer";
import { ApiExecutionResponse } from "@/features/execution/types/execution.types";
import { BodyType, HttpMethod } from "../types/request.types";
import { LoadingState } from "@/components/feedback/loading-state";
import { useToast } from "@/components/feedback/toast-system";
import { EnvironmentSelector } from "@/features/environments/components/environment-selector";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { AssertionBuilder } from "@/features/testing/components/assertion-builder";
import { ScriptEditor } from "@/features/testing/components/script-editor";
import type { TestAssertion } from "@/features/testing/types/testing.types";

interface RequestBuilderProps {
  requestId: string;
  collectionId: string;
}

export function RequestBuilder({ requestId, collectionId }: RequestBuilderProps) {
  const toast = useToast();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: request, isLoading, error } = useRequestDetail(requestId);
  const updateReq = useUpdateRequest(collectionId);
  const executeReq = useExecuteRequest();

  const { data: headers = [] } = useRequestHeaders(requestId);
  const createHeader = useCreateRequestHeader(requestId);
  const deleteHeader = useDeleteRequestHeader(requestId);

  const { data: queryParams = [] } = useQueryParameters(requestId);
  const createParam = useCreateQueryParameter(requestId);
  const deleteParam = useDeleteQueryParameter(requestId);

  // Form State
  const [method, setMethod] = useState<HttpMethod>(request?.method || "GET");
  const [url, setUrl] = useState(request?.url || "");
  const [name, setName] = useState(request?.name || "");
  const [bodyType, setBodyType] = useState<BodyType>(request?.bodyType || "NONE");
  const [body, setBody] = useState(request?.body || "");
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "auth" | "body" | "assertions" | "scripts">("params");
  const [authType, setAuthType] = useState<"none" | "bearer">("none");
  const [authToken, setAuthToken] = useState("");

  // Testing & Scripting State
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [assertions, setAssertions] = useState<TestAssertion[]>([]);
  const [preRequestScript, setPreRequestScript] = useState("");
  const [postRequestScript, setPostRequestScript] = useState("");

  // Track key to reset state on new request selection
  const [lastReqId, setLastReqId] = useState(requestId);
  if (requestId !== lastReqId && request) {
    setLastReqId(requestId);
    setMethod(request.method || "GET");
    setUrl(request.url || "");
    setName(request.name || "");
    setBodyType(request.bodyType || "NONE");
    setBody(request.body || "");
  }

  // New Param & Header Inputs
  const [newParamKey, setNewParamKey] = useState("");
  const [newParamVal, setNewParamVal] = useState("");
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderVal, setNewHeaderVal] = useState("");

  // Execution result
  const [executionResult, setExecutionResult] = useState<ApiExecutionResponse | null>(null);

  const handleSave = () => {
    if (!request) return;
    updateReq.mutate(
      {
        requestId: request.id,
        request: { name, method, url, bodyType, body },
      },
      {
        onSuccess: () => {
          toast.success("Request saved successfully");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to save request");
        },
      }
    );
  };

  const handleSend = () => {
    if (!requestId) return;
    handleSave();
    executeReq.mutate(
      {
        requestId,
        request: {
          environmentId: selectedEnvId || undefined,
        },
      },
      {
        onSuccess: (result) => {
          setExecutionResult(result);
          toast.success("Request executed successfully");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Execution failed");
        },
      }
    );
  };

  const handleAddParam = () => {
    if (!newParamKey.trim()) return;
    createParam.mutate(
      { parameterKey: newParamKey.trim(), parameterValue: newParamVal.trim() },
      {
        onSuccess: () => {
          setNewParamKey("");
          setNewParamVal("");
          toast.success("Query parameter added");
        },
      }
    );
  };

  const handleAddHeader = () => {
    if (!newHeaderKey.trim()) return;
    createHeader.mutate(
      { headerKey: newHeaderKey.trim(), headerValue: newHeaderVal.trim() },
      {
        onSuccess: () => {
          setNewHeaderKey("");
          setNewHeaderVal("");
          toast.success("Request header added");
        },
      }
    );
  };

  const getMethodBadgeClass = (m: HttpMethod) => {
    switch (m) {
      case "GET": return "text-[rgb(var(--success))] border-[rgb(var(--success))]/30 bg-[rgb(var(--success))]/10";
      case "POST": return "text-[rgb(var(--warning))] border-[rgb(var(--warning))]/30 bg-[rgb(var(--warning))]/10";
      case "PUT": return "text-[rgb(var(--info))] border-[rgb(var(--info))]/30 bg-[rgb(var(--info))]/10";
      case "DELETE": return "text-[rgb(var(--danger))] border-[rgb(var(--danger))]/30 bg-[rgb(var(--danger))]/10";
      default: return "text-[rgb(var(--foreground))] border-[rgb(var(--border))]";
    }
  };

  if (isLoading) return <LoadingState message="Loading request builder..." />;
  if (error || !request) return <div className="p-6 text-[rgb(var(--danger))]">Request not found.</div>;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Header & Environment Selector & Save / Send Bar */}
      <div className="flex flex-col gap-3 p-4 border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--card))] shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-[rgb(var(--border))] focus:border-[rgb(var(--primary))] outline-none px-1 transition-colors flex-1"
          />

          <div className="flex items-center gap-2">
            {selectedWorkspaceId && (
              <EnvironmentSelector
                workspaceId={selectedWorkspaceId}
                selectedEnvironmentId={selectedEnvId}
                onSelectEnvironment={(env) => setSelectedEnvId(env?.id || null)}
              />
            )}

            <Button variant="secondary" size="sm" onClick={handleSave} disabled={updateReq.isPending} className="gap-1.5 text-xs">
              <Save className="h-3.5 w-3.5" /> Save
            </Button>
          </div>
        </div>

        {/* URL Bar & Method Select */}
        <div className="flex items-center gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className={`h-10 px-3 font-mono font-bold text-xs rounded-lg border outline-none cursor-pointer transition-colors ${getMethodBadgeClass(method)}`}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>

          <div className="relative flex-1">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/users/{{userId}}"
              className="font-mono text-xs pr-16"
            />
            {url.includes("{{") && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 px-1.5 py-0.5 rounded">
                vars
              </span>
            )}
          </div>

          <Button onClick={handleSend} disabled={executeReq.isPending} className="gap-2 px-5">
            <Send className="h-4 w-4" />
            {executeReq.isPending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>

      {/* Main Builder & Response Split Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Request Tabs & Config Panel */}
        <div className="flex flex-col border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--card))] overflow-hidden">
          <div className="flex border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/30 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab("params")}
              className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
                activeTab === "params" ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]" : "border-transparent text-[rgb(var(--muted-foreground))]"
              }`}
            >
              Params ({queryParams.length})
            </button>
            <button
              onClick={() => setActiveTab("headers")}
              className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
                activeTab === "headers" ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]" : "border-transparent text-[rgb(var(--muted-foreground))]"
              }`}
            >
              Headers ({headers.length})
            </button>
            <button
              onClick={() => setActiveTab("auth")}
              className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
                activeTab === "auth" ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]" : "border-transparent text-[rgb(var(--muted-foreground))]"
              }`}
            >
              Authorization
            </button>
            <button
              onClick={() => setActiveTab("body")}
              className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
                activeTab === "body" ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]" : "border-transparent text-[rgb(var(--muted-foreground))]"
              }`}
            >
              Body ({bodyType})
            </button>
            <button
              onClick={() => setActiveTab("assertions")}
              className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === "assertions" ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]" : "border-transparent text-[rgb(var(--muted-foreground))]"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Tests ({assertions.length})
            </button>
            <button
              onClick={() => setActiveTab("scripts")}
              className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === "scripts" ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]" : "border-transparent text-[rgb(var(--muted-foreground))]"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Scripts
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto text-xs">
            {/* Params Tab */}
            {activeTab === "params" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newParamKey}
                      onChange={(e) => setNewParamKey(e.target.value)}
                      placeholder="Key (e.g. userId)"
                      className="h-8 text-xs font-mono"
                    />
                    <Input
                      value={newParamVal}
                      onChange={(e) => setNewParamVal(e.target.value)}
                      placeholder="Value (e.g. 123)"
                      className="h-8 text-xs font-mono"
                    />
                    <Button size="sm" onClick={handleAddParam} className="h-8 px-3">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border))] text-left text-[rgb(var(--muted-foreground))]">
                      <th className="py-2 px-2">Key</th>
                      <th className="py-2 px-2">Value</th>
                      <th className="py-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--border))]">
                    {queryParams.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 px-2 text-[rgb(var(--primary))] font-semibold">{p.parameterKey}</td>
                        <td className="py-2 px-2 text-[rgb(var(--foreground))]">{p.parameterValue}</td>
                        <td className="py-2 px-2 text-right">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteParam.mutate(p.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-[rgb(var(--danger))]" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Headers Tab */}
            {activeTab === "headers" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    placeholder="Header Key (e.g. Content-Type)"
                    className="h-8 text-xs font-mono"
                  />
                  <Input
                    value={newHeaderVal}
                    onChange={(e) => setNewHeaderVal(e.target.value)}
                    placeholder="Header Value (e.g. application/json)"
                    className="h-8 text-xs font-mono"
                  />
                  <Button size="sm" onClick={handleAddHeader} className="h-8 px-3">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border))] text-left text-[rgb(var(--muted-foreground))]">
                      <th className="py-2 px-2">Header</th>
                      <th className="py-2 px-2">Value</th>
                      <th className="py-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--border))]">
                    {headers.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2 px-2 text-[rgb(var(--primary))] font-semibold">{h.headerKey}</td>
                        <td className="py-2 px-2 text-[rgb(var(--foreground))]">{h.headerValue}</td>
                        <td className="py-2 px-2 text-right">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteHeader.mutate(h.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-[rgb(var(--danger))]" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Auth Tab */}
            {activeTab === "auth" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label>Auth Type:</Label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as "none" | "bearer")}
                    className="h-8 px-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--card))]"
                  >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                  </select>
                </div>

                {authType === "bearer" && (
                  <div className="space-y-2">
                    <Label htmlFor="bearer-token">Token</Label>
                    <Input
                      id="bearer-token"
                      type="password"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Body Tab */}
            {activeTab === "body" && (
              <div className="space-y-3 flex flex-col h-full">
                <div className="flex items-center gap-3">
                  <Label>Body Type:</Label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value as BodyType)}
                    className="h-8 px-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--card))]"
                  >
                    <option value="NONE">None</option>
                    <option value="JSON">JSON</option>
                    <option value="FORM_DATA">Form Data</option>
                    <option value="URL_ENCODED">x-www-form-urlencoded</option>
                    <option value="RAW">Raw</option>
                    <option value="XML">XML</option>
                  </select>
                </div>

                {bodyType !== "NONE" && (
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{\n  "key": "value"\n}'
                    className="font-mono text-xs flex-1 min-h-[220px]"
                  />
                )}
              </div>
            )}

            {/* Assertions / Tests Tab */}
            {activeTab === "assertions" && (
              <AssertionBuilder
                assertions={assertions}
                onChangeAssertions={setAssertions}
                lastExecution={executionResult}
              />
            )}

            {/* Scripts Tab */}
            {activeTab === "scripts" && (
              <ScriptEditor
                preRequestScript={preRequestScript}
                postRequestScript={postRequestScript}
                onChangePreRequestScript={setPreRequestScript}
                onChangePostRequestScript={setPostRequestScript}
              />
            )}
          </div>
        </div>

        {/* Response Viewer Component */}
        <ResponseViewer execution={executionResult} isLoading={executeReq.isPending} />
      </div>
    </div>
  );
}
