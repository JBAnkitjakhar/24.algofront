// src/components/questions/SolutionViewer.tsx - FIXED VERSION

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
      {/* FIXED: Compact Header with Back Button moved to left side */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* FIXED: Back Button now on left side with action links */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="font-medium">Back to Question</span>
            </button>

            {/* YouTube Link */}
            {hasYouTube && (
              <a
                href={solution.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm"
                title="Watch video explanation"
              >
                <Play className="w-3.5 h-3.5" />
                <span className="font-medium">Video</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Drive Link */}
            {hasDrive && (
              <a
                href={solution.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm"
                title="Open drive resources"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="font-medium">Resources</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Right Side - View Mode Controls */}
          <div className="flex items-center space-x-2">
            {/* Visualizer Buttons */}
            {hasVisualizers && (
              <div className="flex items-center space-x-1">
                {solution.visualizerFileIds!.map((fileId, index) => (
                  <button
                    key={fileId}
                    onClick={() => handleVisualizerSelect(fileId)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-sm ${
                      viewMode === 'visualizer' && selectedVisualizerId === fileId
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                    }`}
                    title={`Open visualizer ${index + 1}`}
                  >
                    <CubeTransparentIcon className="w-3.5 h-3.5" />
                    <span className="font-medium">Visual {index + 1}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Code View Button */}
            {hasCodeSnippet && viewMode !== 'code' && (
              <button
                onClick={handleBackToCode}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
                title="View code solution"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="font-medium">Code</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FIXED: Full Height Main Content Area with Resizable Panels */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Code or Visualizer - FULL HEIGHT */}
        <div 
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {viewMode === 'code' ? (
            // FIXED: Code Solution Panel with proper scrolling
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
              
              {/* FIXED: Proper scrollable content area with custom styling for solution viewer */}
              <div className="flex-1 min-h-0 overflow-auto bg-gray-900">
                {hasCodeSnippet ? (
                  <div className="h-full p-4">
                    <pre className="text-sm text-green-400 font-mono leading-relaxed whitespace-pre-wrap break-words">
                      <code>{solution.codeSnippet!.code}</code>
                    </pre>
                  </div>
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

        {/* FIXED: Right Panel - Solution Explanation with full height and proper scrolling */}
        <div 
          className="bg-white dark:bg-gray-800 flex flex-col h-full"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Solution Explanation
            </h3>
          </div>
          
          {/* FIXED: Properly scrollable explanation content */}
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