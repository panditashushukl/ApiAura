"use client";

import { useState, useRef } from "react";
import { useEnvironmentVariables } from "../hooks/use-environment-variables";
import { Sparkles, Variable } from "lucide-react";

interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  selectedEnvId?: string | null;
  multiline?: boolean;
}

export function VariableInput({
  value,
  onChange,
  placeholder,
  className = "",
  selectedEnvId = null,
  multiline = false,
}: VariableInputProps) {
  const { data: envVars = [] } = useEnvironmentVariables(selectedEnvId);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Dynamic environment variables from active environment
  const allSuggestions = envVars.map((v) => ({
    key: v.variableKey,
    value: v.variableValue || "",
    source: "Environment",
  }));

  // Filter based on text typed after `{{`
  const filteredSuggestions = allSuggestions.filter((s) =>
    s.key.toLowerCase().includes(suggestionFilter.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    // Detect if cursor is after `{{`
    const cursorPos = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastOpenIndex = textBeforeCursor.lastIndexOf("{{");

    if (lastOpenIndex !== -1 && !textBeforeCursor.slice(lastOpenIndex).includes("}}")) {
      const filterText = textBeforeCursor.slice(lastOpenIndex + 2);
      setSuggestionFilter(filterText);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertVariable = (varKey: string) => {
    const val = value;
    const cursorPos = inputRef.current?.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursorPos);
    const textAfterCursor = val.slice(cursorPos);
    const lastOpenIndex = textBeforeCursor.lastIndexOf("{{");

    let newVal = "";
    if (lastOpenIndex !== -1 && !textBeforeCursor.slice(lastOpenIndex).includes("}}")) {
      newVal =
        textBeforeCursor.slice(0, lastOpenIndex) + `{{${varKey}}}` + textAfterCursor;
    } else {
      newVal = val + `{{${varKey}}}`;
    }

    onChange(newVal);
    setShowSuggestions(false);
  };

  // Find all variables inside {{...}} in current value for pill display
  const matches = Array.from(value.matchAll(/\{\{([^}]+)\}\}/g)).map((m) => m[1]);

  return (
    <div className="relative w-full space-y-1">
      <div className="relative">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`w-full rounded-xl border border-[rgb(var(--input))] bg-[rgb(var(--background))]/60 p-3 text-xs font-mono text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30 transition ${className}`}
            rows={4}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`w-full h-9 rounded-xl border border-[rgb(var(--input))] bg-[rgb(var(--background))]/60 px-3 text-xs font-mono text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30 transition ${className}`}
          />
        )}

        {/* Floating Interactive Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-2xl border border-blue-500/30 bg-[rgb(var(--card))]/95 backdrop-blur-2xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 glass-dropdown">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-blue-400 border-b border-[rgb(var(--border))]/50 mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse text-blue-400" />
                ENVIRONMENT VARIABLES
              </span>
              <span className="font-mono text-zinc-400">{filteredSuggestions.length} found</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
              {filteredSuggestions.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => insertVariable(s.key)}
                  className="flex items-center justify-between w-full p-2 rounded-xl text-left hover:bg-blue-500/10 hover:border-blue-500/20 border border-transparent transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Variable className="h-3.5 w-3.5 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-xs font-semibold text-blue-400 truncate">
                      {`{{${s.key}}}`}
                    </span>
                  </div>

                  <span className="text-[10px] font-medium text-[rgb(var(--muted-foreground))] truncate max-w-[90px] bg-[rgb(var(--secondary))] px-1.5 py-0.5 rounded">
                    {s.value || s.source}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Variables Pills & Helper Row */}
      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
        {matches.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[rgb(var(--muted-foreground))] font-semibold">Used:</span>
            {matches.map((v, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/30 px-1.5 py-0.5 font-mono text-blue-400 font-semibold shadow-2xs"
              >
                <Variable className="h-2.5 w-2.5 text-blue-400" />
                {v}
              </span>
            ))}
          </div>
        )}

        {/* Quick Add Variable Pill */}
        {allSuggestions.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-[rgb(var(--muted-foreground))] hidden sm:inline">Quick Insert:</span>
            {allSuggestions.slice(0, 3).map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => insertVariable(s.key)}
                className="rounded-md border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/20 text-blue-400 px-1.5 py-0.5 font-mono font-medium transition cursor-pointer"
              >
                + {`{{${s.key}}}`}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
