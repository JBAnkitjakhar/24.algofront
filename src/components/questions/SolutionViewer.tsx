// src/components/questions/SolutionViewer.tsx - MINIMAL FIXES ONLY

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Play, 
  FolderOpen, 
  ExternalLink, 
  Code, 
  ArrowLeft,
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { EmbeddedVisualizer } from '@/components/common/EmbeddedVisualizer';
import { CodeSyntaxHighlighter } from '@/components/common/CodeSyntaxHighlighter'; // NEW IMPORT
import type { Solution } from '@/types';
import { CubeIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';

interface SolutionViewerProps {
  solution: Solution;
  onBack: () => void;
}

type ViewMode = 'code' | 'visualizer';

export function SolutionViewer({ solution, onBack }: SolutionViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [selectedVisualizerId, setSelectedVisualizerId] = useState<string | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
  const isResizingRef = useRef(false);

  const hasCodeSnippet = solution.codeSnippet && solution.codeSnippet.code.trim();
  const hasVisualizers = solution.visualizerFileIds && solution.visualizerFileIds.length > 0;
  const hasYouTube = solution.youtubeLink;
  const hasDrive = solution.driveLink;

  const handleVisualizerSelect = useCallback((fileId: string) => {
    setSelectedVisualizerId(fileId);
    setViewMode('visualizer');
  }, []);

  const handleBackToCode = useCallback(() => {
    setViewMode('code');
    setSelectedVisualizerId(null);
  }, []);

  // Handle resizing for left/right panels
  const handlePanelMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      isResizingRef.current = true;
      const startX = e.clientX;
      const startWidth = leftPanelWidth;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const deltaX = e.clientX - startX;
        const containerWidth = window.innerWidth;
        const deltaPercent = (deltaX / containerWidth) * 100;
        const newWidth = Math.min(Math.max(startWidth + deltaPercent, 30), 70);

        setLeftPanelWidth(newWidth);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        isResizingRef.current = false;
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [leftPanelWidth]
  );

  // Load saved panel width
  useEffect(() => {
    const savedWidth = localStorage.getItem("solution_viewer_panel_width");
    if (savedWidth) {
      setLeftPanelWidth(parseFloat(savedWidth));
    }
  }, []);

  // Save panel width
  useEffect(() => {
    localStorage.setItem("solution_viewer_panel_width", leftPanelWidth.toString());
  }, [leftPanelWidth]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* FIXED: Full Height Main Content Area with Resizable Panels */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Code or Visualizer - FULL HEIGHT */}
        <div 
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {viewMode === 'code' ? (
            // FIXED: Code Solution Panel with CodeSyntaxHighlighter instead of green text
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Solution Code
                  </h3>
                  {hasCodeSnippet && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {solution.codeSnippet!.language}
                    </span>
                  )}
                </div>
              </div>
              
              {/* FIXED: Replace green code with CodeSyntaxHighlighter */}
              <div className="flex-1 min-h-0 overflow-auto">
                {hasCodeSnippet ? (
                  <CodeSyntaxHighlighter
                    codeSnippet={solution.codeSnippet!}
                    showHeader={false}
                    className="h-full border-0 rounded-none"
                    height="100%"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No code solution provided</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // FIXED: Visualizer Panel with full height
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <CubeIcon className="w-4 h-4 mr-2" />
                    Interactive Visualizer
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBackToCode}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Back to Code
                    </button>
                  </div>
                </div>
              </div>
              
              {/* FIXED: Full height visualizer container */}
              <div className="flex-1 min-h-0">
                {selectedVisualizerId && (
                  <EmbeddedVisualizer
                    fileId={selectedVisualizerId}
                    title="Algorithm Visualizer"
                    height="100%"
                    className="h-full border-0 rounded-none"
                    onError={(error) => console.error('Visualizer error:', error)}
                    onFileNotFound={(fileId) => {
                      console.warn('Visualizer file not found:', fileId);
                      setViewMode('code');
                      setSelectedVisualizerId(null);
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors relative group flex-shrink-0"
          onMouseDown={handlePanelMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20"></div>
        </div>

        {/* Right Panel - Solution Explanation (unchanged) */}
        <div 
          className="bg-white dark:bg-gray-800 flex flex-col h-full"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Solution Explanation
              </h3>
              
              {/* All action buttons moved here */}
              <div className="flex items-center space-x-2">
                {/* Back Button */}
                <button
                  onClick={onBack}
                  className="flex items-center px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors text-xs"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  <span className="font-medium">Back to Question</span>
                </button>

                {/* YouTube Link */}
                {hasYouTube && (
                  <a
                    href={solution.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-xs"
                    title="Watch video explanation"
                  >
                    <Play className="w-3 h-3" />
                    <span className="font-medium">Video</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}

                {/* Drive Link */}
                {hasDrive && (
                  <a
                    href={solution.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors text-xs"
                    title="Open drive resources"
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span className="font-medium">Resources</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}

                {/* Visualizer Buttons */}
                {hasVisualizers && (
                  <div className="flex items-center space-x-1">
                    {solution.visualizerFileIds!.map((fileId, index) => (
                      <button
                        key={fileId}
                        onClick={() => handleVisualizerSelect(fileId)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors text-xs ${
                          viewMode === 'visualizer' && selectedVisualizerId === fileId
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                        }`}
                        title={`Open visualizer ${index + 1}`}
                      >
                        <CubeTransparentIcon className="w-3 h-3" />
                        <span className="font-medium">Visual {index + 1}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Code View Button */}
                {hasCodeSnippet && viewMode !== 'code' && (
                  <button
                    onClick={handleBackToCode}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 rounded transition-colors text-xs"
                    title="View code solution"
                  >
                    <Code className="w-3 h-3" />
                    <span className="font-medium">Code</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Solution content */}
          <div className="flex-1 min-h-0 overflow-auto p-6">
            <div className="max-w-none">
              <MarkdownRenderer 
                content={solution.content}
                className="text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}