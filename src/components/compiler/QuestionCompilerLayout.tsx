// src/components/compiler/QuestionCompilerLayout.tsx

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Editor } from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Palette,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Language,
  getDefaultLanguage,
} from "@/lib/compiler/languages";
import { LanguageSelector } from "./LanguageSelector";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import type { editor } from "monaco-editor";
import { Question } from "@/types/admin";

// Monaco Editor Themes (same as main compiler)
const MONACO_THEMES = [
  { name: "VS Code Light", value: "light", preview: "bg-white text-gray-900" },
  { name: "VS Code Dark", value: "vs-dark", preview: "bg-gray-800 text-white" },
  { name: "Monokai", value: "monokai", preview: "bg-gray-900 text-green-400" },
  {
    name: "Dracula",
    value: "dracula",
    preview: "bg-purple-900 text-purple-200",
  },
  { name: "Cobalt", value: "cobalt", preview: "bg-blue-900 text-blue-200" },
  {
    name: "One Dark",
    value: "one-dark",
    preview: "bg-gray-900 text-orange-400",
  },
  { name: "Eclipse", value: "eclipse", preview: "bg-gray-100 text-gray-800" },
];

// Custom Monaco Themes (same as main compiler)
const customThemes = {
  monokai: {
    base: "vs-dark" as const,
    inherit: true,
    rules: [
      { token: "", foreground: "F8F8F2", background: "272822" },
      { token: "comment", foreground: "75715E" },
      { token: "keyword", foreground: "F92672" },
      { token: "string", foreground: "E6DB74" },
      { token: "number", foreground: "AE81FF" },
      { token: "regexp", foreground: "FD971F" },
      { token: "operator", foreground: "F92672" },
      { token: "namespace", foreground: "F92672" },
      { token: "type", foreground: "66D9EF" },
      { token: "struct", foreground: "A6E22E" },
      { token: "class", foreground: "A6E22E" },
      { token: "interface", foreground: "A6E22E" },
      { token: "parameter", foreground: "FD971F" },
      { token: "variable", foreground: "F8F8F2" },
      { token: "function", foreground: "A6E22E" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#F8F8F2",
      "editorCursor.foreground": "#F8F8F0",
      "editor.lineHighlightBackground": "#3E3D32",
      "editorLineNumber.foreground": "#90908A",
      "editor.selectionBackground": "#49483E",
      "editor.inactiveSelectionBackground": "#49483E",
    },
  },
  // Add other themes as needed...
};

interface QuestionCompilerLayoutProps {
  question: Question;
}

export const QuestionCompilerLayout: React.FC<QuestionCompilerLayoutProps> = ({
  question,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    getDefaultLanguage()
  );
  const [code, setCode] = useState<string>(getDefaultLanguage().defaultCode);
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isOutputCopied, setIsOutputCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Input/Output panel states
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [showOutputPanel, setShowOutputPanel] = useState(false);
  const [inputOutputHeight, setInputOutputHeight] = useState(30); // Percentage of bottom area

  // Refs for Monaco Editor management
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingRef = useRef(false);

  const { mutate: executeCode, isPending, error } = useCodeExecution();

  // Local storage keys for persistence - wrapped in useCallback to fix React Hook dependency issues
  const getStorageKey = useCallback(
    (language: string, type: "code" | "input") =>
      `question_${question.id}_${language}_${type}`,
    [question.id]
  );

  // Get code snippet for current language if available - wrapped in useCallback
  const getInitialCodeForLanguage = useCallback(
    (language: Language): string => {
      const snippet = question.codeSnippets?.find(
        (snippet) => snippet.language.toLowerCase() === language.name.toLowerCase()
      );
      return snippet?.code || language.defaultCode;
    },
    [question.codeSnippets]
  );

  // Debounced resize function to prevent Monaco Editor errors
  const debouncedResizeEditor = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      if (editorRef.current && !isResizingRef.current) {
        try {
          requestAnimationFrame(() => {
            try {
              editorRef.current?.layout();
            } catch (error) {
              console.warn(
                "Monaco Editor layout error (safe to ignore):",
                error
              );
            }
          });
        } catch (error) {
          console.warn("Monaco Editor resize error (safe to ignore):", error);
        }
      }
      isResizingRef.current = false;
    }, 150);
  }, []);

  // Handle resizing for input/output panels
  const handleInputOutputMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const container = e.currentTarget.parentElement?.parentElement;
      if (!container) return;

      const startY = e.clientY;
      const startHeight = inputOutputHeight;
      const containerHeight = container.clientHeight;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const deltaY = startY - e.clientY; // Inverted because we're expanding upward
        const deltaPercent = (deltaY / containerHeight) * 100;
        const newHeight = Math.min(
          Math.max(startHeight + deltaPercent, 15),
          60
        );
        setInputOutputHeight(newHeight);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        
        // Trigger editor resize after panel resize
        debouncedResizeEditor();
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "row-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [inputOutputHeight, debouncedResizeEditor]
  );

  // Load saved preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem("question_compiler_fontSize");
    const savedTheme = localStorage.getItem("question_compiler_editorTheme");

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedTheme) setEditorTheme(savedTheme);
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem("question_compiler_fontSize", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("question_compiler_editorTheme", editorTheme);
  }, [editorTheme]);

  // Save code to localStorage when it changes
  useEffect(() => {
    if (code && code !== selectedLanguage.defaultCode) {
      localStorage.setItem(getStorageKey(selectedLanguage.name, "code"), code);
    }
  }, [code, selectedLanguage.name, selectedLanguage.defaultCode, question.id, getStorageKey]);

  // Save input to localStorage when it changes
  useEffect(() => {
    if (input) {
      localStorage.setItem(
        getStorageKey(selectedLanguage.name, "input"),
        input
      );
    }
  }, [input, selectedLanguage.name, question.id, getStorageKey]);

  // Function to check if code requires input
  const doesCodeRequireInput = (codeString: string): boolean => {
    const inputPatterns = [
      /Scanner.*nextInt|Scanner.*nextLine|Scanner.*next\(\)|System\.in/i,
      /input\s*\(/i,
      /cin\s*>>/i,
      /readline|process\.stdin/i,
    ];
    return inputPatterns.some((pattern) => pattern.test(codeString));
  };

  // Language change handler
  const handleLanguageChange = (language: Language) => {
    // Save current code and input before switching
    if (code !== selectedLanguage.defaultCode) {
      localStorage.setItem(getStorageKey(selectedLanguage.name, "code"), code);
    }
    if (input) {
      localStorage.setItem(
        getStorageKey(selectedLanguage.name, "input"),
        input
      );
    }

    // Load saved code/input for new language
    const savedCode = localStorage.getItem(
      getStorageKey(language.name, "code")
    );
    const savedInput = localStorage.getItem(
      getStorageKey(language.name, "input")
    );

    setSelectedLanguage(language);

    setTimeout(() => {
      setCode(savedCode || language.defaultCode);
      setInput(savedInput || "");
      setOutput("");
    }, 0);
  };

  const handleRunCode = () => {
    // Auto-expand output panel and hide input panel
    setShowOutputPanel(true);
    setShowInputPanel(false);
    
    // Check if code requires input but none provided
    if (doesCodeRequireInput(code) && !input.trim()) {
      setOutput(
        `❌ Input Required!\n\nYour ${selectedLanguage.name} code appears to require input. Please provide input in the Input section.\n\nExample input format:\n- Each input on a new line\n- For numbers: 123\n- For text: Hello World`
      );
      return;
    }

    setOutput("🚀 Executing code...\n⏳ Please wait...");
    executeCode(
      {
        language: selectedLanguage.pistonName,
        version: selectedLanguage.version,
        code,
        input: input.trim(),
      },
      {
        onSuccess: (response) => {
          if (!response.success || !response.data) {
            setOutput("❌ Invalid response from server");
            return;
          }

          let result = response.data;

          // Check if there's another data layer and unwrap it
          if (result.data && !result.run) {
            result = result.data;
          }

          // Check if the backend indicates failure
          if (result.successful === false && result.errorMessage) {
            setOutput(`❌ Backend Error: ${result.errorMessage}`);
            return;
          }

          let outputText = "";

          // Show compilation output if present
          if (result.compile) {
            if (result.compile.stderr) {
              outputText += `❌ Compilation Error:\n${result.compile.stderr}\n\n`;
            }
            if (result.compile.stdout) {
              outputText += `📋 Compilation Output:\n${result.compile.stdout}\n\n`;
            }
            if (result.compile.code !== 0) {
              outputText += `❌ Compilation failed with exit code: ${result.compile.code}\n\n`;
              outputText += `💡 Common fixes:\n- Check syntax errors\n- Verify class name matches filename\n- Check for missing semicolons or brackets\n\n`;
            }
          }

          // Check if run exists and show runtime output
          if (result.run && typeof result.run === "object") {
            if (result.run.stderr) {
              outputText += `🚨 Runtime Error:\n${result.run.stderr}\n`;

              // Add helpful hints for common errors
              if (result.run.stderr.includes("NoSuchElementException")) {
                outputText += `\n💡 Hint: This error usually means your program expected more input than provided.\n`;
              } else if (result.run.stderr.includes("InputMismatchException")) {
                outputText += `\n💡 Hint: Input type mismatch. Check if you're providing the correct data type.\n`;
              }
            }

            if (result.run.stdout) {
              outputText += result.run.stdout;
            }

            if (result.run.code !== 0 && !result.run.stderr) {
              outputText += `\n⚠️ Program exited with code: ${result.run.code}`;
            } else if (result.run.code === 0 && result.run.stdout) {
              outputText += `\n✅ Program completed successfully!`;
            }
          } else {
            outputText += `❌ Could not find execution results`;
          }

          setOutput(outputText || "✅ Program completed with no output");
        },
        onError: (error: Error) => {
          console.error("Code execution error:", error);
          setOutput(`❌ Execution Error: ${error.message}`);
        },
      }
    );
  };

  const handleReset = () => {
    setCode(selectedLanguage.defaultCode);
    setInput("");
    setOutput("");
    setShowInputPanel(false);
    setShowOutputPanel(false);
    // Clear localStorage
    localStorage.removeItem(getStorageKey(selectedLanguage.name, "code"));
    localStorage.removeItem(getStorageKey(selectedLanguage.name, "input"));
  };

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setIsOutputCopied(true);
      setTimeout(() => setIsOutputCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy output:", err);
    }
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  };

  // Monaco Editor mount handler
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    try {
      editorRef.current = editor;
      setTimeout(() => {
        try {
          editor.layout();
        } catch (error) {
          console.warn("Initial Monaco layout error (safe to ignore):", error);
        }
      }, 100);
    } catch (error) {
      console.warn("Monaco Editor mount error (safe to ignore):", error);
    }
  };

  // Monaco Editor beforeMount
  const handleEditorWillMount = (monaco: typeof import("monaco-editor")) => {
    try {
      Object.entries(customThemes).forEach(([name, theme]) => {
        try {
          monaco.editor.defineTheme(name, theme);
        } catch (error) {
          console.warn(
            `Failed to define theme ${name} (safe to ignore):`,
            error
          );
        }
      });
    } catch (error) {
      console.warn("Failed to define custom themes (safe to ignore):", error);
    }
  };

  // Update code when language changes to use question's code snippet
  useEffect(() => {
    const savedCode = localStorage.getItem(
      getStorageKey(selectedLanguage.name, "code")
    );
    
    if (savedCode) {
      setCode(savedCode);
    } else {
      const initialCode = getInitialCodeForLanguage(selectedLanguage);
      setCode(initialCode);
    }
  }, [selectedLanguage, getStorageKey, getInitialCodeForLanguage]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Code Editor
          </h2>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Font Size Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={decreaseFontSize}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Decrease font size"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs text-gray-500 min-w-[2rem] text-center">
              {fontSize}px
            </span>
            <button
              onClick={increaseFontSize}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Increase font size"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Change editor theme"
            >
              <Palette size={14} />
            </button>

            {showThemeSelector && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[150px]">
                {MONACO_THEMES.map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setEditorTheme(themeOption.value);
                      setShowThemeSelector(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                      editorTheme === themeOption.value
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded ${themeOption.preview}`}
                      ></div>
                      <span>{themeOption.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleRunCode}
            disabled={isPending || !code.trim()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play size={14} />
            <span>{isPending ? "Running..." : "Run"}</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Code Editor */}
        <div 
          className="flex-1 min-h-0"
          style={{ 
            height: (showInputPanel || showOutputPanel) 
              ? `${100 - inputOutputHeight}%` 
              : '100%' 
          }}
        >
          <Editor
            key={`question-${question.id}-${selectedLanguage.name}`}
            height="100%"
            language={selectedLanguage.monacoLanguage}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme={editorTheme}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
            options={{
              fontSize: fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              lineNumbers: "on",
              renderWhitespace: "selection",
              tabSize: 2,
              insertSpaces: true,
              folding: true,
              contextmenu: true,
              selectOnLineNumbers: true,
              cursorBlinking: "blink",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
            }}
          />
        </div>

        {/* Input/Output Panel */}
        {(showInputPanel || showOutputPanel) && (
          <div 
            className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
            style={{ height: `${inputOutputHeight}%` }}
          >
            {/* Resizer */}
            <div
              className="h-1 bg-gray-300 dark:bg-gray-600 cursor-row-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors relative group"
              onMouseDown={handleInputOutputMouseDown}
            >
              <div className="absolute inset-x-0 -top-1 -bottom-1 group-hover:bg-blue-500/20"></div>
            </div>

            {/* Input Panel */}
            {showInputPanel && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Input
                  </h3>
                  <button
                    onClick={() => setShowInputPanel(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="flex-1 p-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter input for your program (each input on a new line)..."
                    className="w-full h-full resize-none border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontSize: `${fontSize - 2}px` }}
                    disabled={isPending}
                  />
                </div>
              </div>
            )}

            {/* Output Panel */}
            {showOutputPanel && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Output
                  </h3>
                  <div className="flex items-center space-x-2">
                    {output && (
                      <button
                        onClick={handleCopyOutput}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {isOutputCopied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{isOutputCopied ? "Copied!" : "Copy"}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowOutputPanel(false)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-3">
                  <pre
                    className="w-full h-full text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 whitespace-pre-wrap break-words overflow-auto text-gray-900 dark:text-gray-100"
                    style={{ fontSize: `${fontSize - 2}px` }}
                  >
                    {isPending
                      ? "🚀 Executing code...\n⏳ Please wait..."
                      : output ||
                        "💻 Run your code to see output here"}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!showInputPanel && (
              <button
                onClick={() => {
                  setShowInputPanel(true);
                  setShowOutputPanel(false);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ChevronUp size={14} />
                <span>Input</span>
              </button>
            )}
            
            {!showOutputPanel && output && (
              <button
                onClick={() => {
                  setShowOutputPanel(true);
                  setShowInputPanel(false);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <ChevronUp size={14} />
                <span>Output</span>
              </button>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              Error: {error.message}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close theme selector */}
      {showThemeSelector && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowThemeSelector(false)}
        />
      )}
    </div>
  );
};