// src/components/common/EmbeddedVisualizer.tsx - Display HTML visualizers within the website

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

interface EmbeddedVisualizerProps {
  fileId: string;
  title?: string;
  className?: string;
  height?: string;
  onError?: (error: string) => void;
}

export function EmbeddedVisualizer({
  fileId,
  title = 'Algorithm Visualizer',
  className = '',
  height = '400px',
  onError,
}: EmbeddedVisualizerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch HTML content from backend
  useEffect(() => {
    const fetchVisualizerContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/files/visualizers/${fileId}`, {
          credentials: 'include', // Include authentication cookies
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required to view this visualizer');
          } else if (response.status === 404) {
            throw new Error('Visualizer file not found');
          } else {
            throw new Error(`Failed to load visualizer: ${response.status}`);
          }
        }

        const htmlText = await response.text();
        setHtmlContent(htmlText);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load visualizer';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (fileId) {
      fetchVisualizerContent();
    }
  }, [fileId, onError]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Create blob URL for the HTML content
  const createBlobUrl = (content: string) => {
    const blob = new Blob([content], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  if (error) {
    return (
      <div className={`border border-red-200 rounded-lg p-4 bg-red-50 ${className}`}>
        <div className="flex items-center text-red-800">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <div className="font-medium">Unable to load visualizer</div>
            <div className="text-sm text-red-600 mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 bg-gray-50 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading visualizer...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        {/* Header */}
        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Open in fullscreen"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="relative" style={{ height }}>
          {htmlContent && (
            <iframe
              ref={iframeRef}
              src={createBlobUrl(htmlContent)}
              title={title}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              sandbox="allow-scripts allow-same-origin allow-forms"
              style={{ minHeight: height }}
            />
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Transition appear show={isFullscreen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsFullscreen(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full h-full max-w-7xl max-h-[90vh] transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                  {/* Fullscreen Header */}
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsFullscreen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded"
                        title="Exit fullscreen"
                      >
                        <ArrowsPointingInIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setIsFullscreen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded"
                        title="Close"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Fullscreen Content */}
                  <div className="h-full" style={{ height: 'calc(90vh - 80px)' }}>
                    {htmlContent && (
                      <iframe
                        src={createBlobUrl(htmlContent)}
                        title={`${title} - Fullscreen`}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    )}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

// Simple visualizer preview component for lists/cards
interface VisualizerPreviewProps {
  fileId: string;
  title?: string;
  onPreview?: () => void;
}

export function VisualizerPreview({ fileId, title, onPreview }: VisualizerPreviewProps) {
  const [thumbnailContent, setThumbnailContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate a simple thumbnail preview
  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/files/visualizers/${fileId}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const content = await response.text();
          // Extract title or first meaningful text for preview
          const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
          const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
          const preview = titleMatch?.[1] || h1Match?.[1] || title || 'Interactive Visualizer';
          setThumbnailContent(preview);
        }
      } catch (error) {
        console.error(error);
        setThumbnailContent(title || 'Visualizer Preview');
      } finally {
        setIsLoading(false);
      }
    };

    if (fileId) {
      generateThumbnail();
    }
  }, [fileId, title]);

  return (
    <div 
      className="border border-purple-200 rounded-lg p-3 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
      onClick={onPreview}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-200 rounded flex items-center justify-center">
            <span className="text-purple-600 text-xs font-bold">HTML</span>
          </div>
          <div>
            <div className="text-sm font-medium text-purple-800">
              {isLoading ? 'Loading...' : thumbnailContent}
            </div>
            <div className="text-xs text-purple-600">Click to view</div>
          </div>
        </div>
        <ArrowsPointingOutIcon className="h-4 w-4 text-purple-600" />
      </div>
    </div>
  );
}