// src/components/questions/SolutionViewer.tsx - FINAL CLEAN VERSION

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
import { CodeSyntaxHighlighter } from '@/components/common/CodeSyntaxHighlighter';
import { useVisualizerFilesBySolution } from '@/hooks/useSolutionManagement';
import { cookieManager } from '@/lib/utils/auth';
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
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const isResizingRef = useRef(false);

  // Fetch visualizer files data
  const { 
    data: visualizerFiles, 
    isLoading: visualizerFilesLoading,
    error: visualizerFilesError 
  } = useVisualizerFilesBySolution(solution.id);

  const hasCodeSnippet = solution.codeSnippet && solution.codeSnippet.code.trim();
  const hasVisualizers = Boolean(visualizerFiles?.data && visualizerFiles.data.length > 0);
  const hasYouTube = solution.youtubeLink;
  const hasDrive = solution.driveLink;

  // Fetch HTML content and create blob URL (same approach as popup)
  const fetchVisualizerContent = useCallback(async (fileId: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = cookieManager.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const url = `${apiBaseUrl}/files/visualizers/${fileId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to load visualizer: ${response.status}`);
      }

      const htmlText = await response.text();

      // Create blob URL like the popup does
      const blob = new Blob([htmlText], { type: 'text/html' });
      const url_blob = URL.createObjectURL(blob);
      
      setBlobUrl(url_blob);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load visualizer';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVisualizerSelect = useCallback((fileId: string) => {
    setSelectedVisualizerId(fileId);
    setViewMode('visualizer');
    fetchVisualizerContent(fileId);
  }, [fetchVisualizerContent]);

  const handleBackToCode = useCallback(() => {
    setViewMode('code');
    setSelectedVisualizerId(null);
    setBlobUrl('');
    setError('');
  }, []);

  // Enhanced panel resizing with smooth behavior
  const handlePanelMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      isResizingRef.current = true;
      const startX = e.clientX;
      const startWidth = leftPanelWidth;

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizingRef.current) return;
        
        e.preventDefault();
        const deltaX = e.clientX - startX;
        const containerWidth = window.innerWidth;
        const deltaPercent = (deltaX / containerWidth) * 100;
        const newWidth = Math.min(Math.max(startWidth + deltaPercent, 25), 75);

        setLeftPanelWidth(newWidth);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        document.body.style.pointerEvents = "";
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      document.body.style.pointerEvents = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [leftPanelWidth]
  );

  // Load and save panel width
  useEffect(() => {
    const savedWidth = localStorage.getItem("solution_viewer_panel_width");
    if (savedWidth) {
      setLeftPanelWidth(parseFloat(savedWidth));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("solution_viewer_panel_width", leftPanelWidth.toString());
  }, [leftPanelWidth]);

  // Cleanup blob URL when component unmounts or changes
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Panel - Code or Visualizer */}
        <div 
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full relative"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {viewMode === 'code' ? (
            // Code Solution Panel
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
            // Visualizer Panel with Blob URL Approach
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <CubeTransparentIcon className="w-4 h-4 mr-2" />
                    Algorithm Visualizer
                  </h3>
                </div>
              </div>
              
              <div className="flex-1 min-h-0 p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-300 text-sm">
                      Loading visualizer...
                    </span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400">
                    <div className="text-center">
                      <div className="text-sm font-medium">Failed to load visualizer</div>
                      <div className="text-xs mt-1 text-red-500 dark:text-red-400">{error}</div>
                    </div>
                  </div>
                ) : blobUrl ? (
                  <div className="w-full h-full border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <iframe
                      src={blobUrl}
                      title="Algorithm Visualizer"
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <CubeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No visualizer selected</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Resizer with better visual feedback */}
        <div
          className={`w-1 cursor-col-resize relative group flex-shrink-0 transition-colors ${
            isResizingRef.current 
              ? 'bg-blue-500 dark:bg-blue-400' 
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 dark:hover:bg-blue-400'
          }`}
          onMouseDown={handlePanelMouseDown}
        >
          <div className="absolute inset-y-0 -left-2 -right-2 group-hover:bg-blue-500/10"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col space-y-0.5">
              <div className="w-0.5 h-1 bg-white rounded-full"></div>
              <div className="w-0.5 h-1 bg-white rounded-full"></div>
              <div className="w-0.5 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Panel - Solution Explanation */}
        <div 
          className="bg-white dark:bg-gray-800 flex flex-col h-full"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Action buttons */}
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
                {visualizerFilesLoading ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">Loading visualizers...</div>
                ) : visualizerFilesError ? (
                  <div className="text-xs text-red-500 dark:text-red-400">Failed to load visualizers</div>
                ) : hasVisualizers ? (
                  <div className="flex items-center space-x-1">
                    {visualizerFiles?.data?.map((file) => (
                      <button
                        key={file.fileId}
                        onClick={() => handleVisualizerSelect(file.fileId)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors text-xs ${
                          viewMode === 'visualizer' && selectedVisualizerId === file.fileId
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                        }`}
                      >
                        <CubeTransparentIcon className="w-3 h-3" />
                        <span className="font-medium">Visualizer</span>
                      </button>
                    ))}
                  </div>
                ) : null}

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

        {/* Resizing overlay to prevent iframe interference during resize */}
        {isResizingRef.current && (
          <div className="absolute inset-0 bg-transparent cursor-col-resize z-10" />
        )}
      </div>
    </div>
  );
}