// src/components/questions/UserApproaches.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  Code, 
  Edit, 
  Trash2, 
  FileText,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { 
  useApproachesByQuestion, 
  useDeleteApproach, 
  useUpdateApproach,
  useQuestionSizeUsage,
} from '@/hooks/useApproachManagement';
import { APPROACH_VALIDATION } from '@/constants';
import { dateUtils } from '@/lib/utils/common';
import type { ApproachDTO, UpdateApproachRequest } from '@/types';

interface UserApproachesProps {
  questionId: string;
}

interface ApproachModalProps {
  approach: ApproachDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateApproachRequest) => void;
  isLoading: boolean;
}

// Modal for editing approach description
function EditApproachModal({ approach, isOpen, onClose, onSave, isLoading }: ApproachModalProps) {
  const [textContent, setTextContent] = useState(approach?.textContent || '');
  const [error, setError] = useState<string | null>(null);

  // FIXED: Reset form when approach changes - use useEffect instead of useState
  useEffect(() => {
    setTextContent(approach?.textContent || '');
    setError(null);
  }, [approach]);

  if (!isOpen || !approach) return null;

  const handleSave = () => {
    setError(null);

    // Validate text content
    if (!textContent.trim()) {
      setError('Description cannot be empty');
      return;
    }

    if (textContent.trim().length < APPROACH_VALIDATION.TEXT_MIN_LENGTH) {
      setError(`Description must be at least ${APPROACH_VALIDATION.TEXT_MIN_LENGTH} characters long`);
      return;
    }

    if (textContent.length > APPROACH_VALIDATION.TEXT_MAX_LENGTH) {
      setError(`Description must not exceed ${APPROACH_VALIDATION.TEXT_MAX_LENGTH} characters`);
      return;
    }

    onSave({
      textContent: textContent.trim(),
      codeContent: approach.codeContent,
      codeLanguage: approach.codeLanguage,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Approach Description
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Text Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Approach Description
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Describe your approach, algorithm, time/space complexity, etc..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>
                {textContent.length}/{APPROACH_VALIDATION.TEXT_MAX_LENGTH} characters
              </span>
              <span>
                Min: {APPROACH_VALIDATION.TEXT_MIN_LENGTH} characters
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* FIXED: Code Preview (Read-only) - replaced CodeSyntaxHighlighter with simple pre/code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Code ({approach.codeLanguage})
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <pre 
                className="text-sm font-mono bg-gray-50 dark:bg-gray-900 p-3 overflow-auto text-gray-900 dark:text-gray-100 custom-scrollbar"
                style={{ maxHeight: "200px" }}
              >
                <code>{approach.codeContent || ''}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !textContent.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Individual approach card component
function ApproachCard({ 
  approach, 
  onEdit, 
  onDelete 
}: { 
  approach: ApproachDTO; 
  onEdit: () => void; 
  onDelete: () => void; 
}) {
  const [showCode, setShowCode] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this approach? This action cannot be undone.')) {
      onDelete();
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Submitted {dateUtils.formatRelativeTime(approach.createdAt)}
          </span>
          {approach.updatedAt !== approach.createdAt && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (Updated {dateUtils.formatRelativeTime(approach.updatedAt)})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onEdit}
            className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Edit description"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete approach"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mb-3">
        {approach.textContent === "Click edit to add your approach description and explanation..." ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">
            Click the edit button to add your approach description and explanation...
          </p>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
            {approach.textContent}
          </p>
        )}
      </div>

      {/* Code Section */}
      {approach.codeContent && (
        <div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-2"
          >
            <Code size={14} />
            <span>
              {showCode ? 'Hide' : 'Show'} Code ({approach.codeLanguage})
            </span>
          </button>

          {showCode && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <pre 
                className="text-sm font-mono bg-gray-50 dark:bg-gray-900 p-3 overflow-auto text-gray-900 dark:text-gray-100 custom-scrollbar"
                style={{ maxHeight: "300px" }}
              >
                <code>{approach.codeContent}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <span>Size: {(approach.contentSize / 1024).toFixed(2)} KB</span>
        <span>Language: {approach.codeLanguage}</span>
      </div>
    </div>
  );
}

export function UserApproaches({ questionId }: UserApproachesProps) {
  const [editingApproach, setEditingApproach] = useState<ApproachDTO | null>(null);
  
  // API hooks
  const { data: approaches = [], isLoading, error } = useApproachesByQuestion(questionId);
  const { data: sizeUsage } = useQuestionSizeUsage(questionId);
  const deleteApproachMutation = useDeleteApproach();
  const updateApproachMutation = useUpdateApproach();

  // Handle edit approach
  const handleEditApproach = (approach: ApproachDTO) => {
    setEditingApproach(approach);
  };

  // Handle save approach
  const handleSaveApproach = (data: UpdateApproachRequest) => {
    if (!editingApproach) return;

    updateApproachMutation.mutate(
      { id: editingApproach.id, data },
      {
        onSuccess: () => {
          setEditingApproach(null);
        },
      }
    );
  };

  // Handle delete approach
  const handleDeleteApproach = (id: string) => {
    deleteApproachMutation.mutate(id);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="flex space-x-2">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Failed to Load Approaches
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {error.message || 'An error occurred while loading your approaches.'}
        </p>
      </div>
    );
  }

  // Empty state
  if (approaches.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Approaches Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Submit your first approach using the Submit button in the code editor.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>You can submit up to {APPROACH_VALIDATION.MAX_APPROACHES_PER_QUESTION} approaches per question</p>
          <p>Total size limit: {(APPROACH_VALIDATION.MAX_TOTAL_SIZE_PER_USER_PER_QUESTION / 1024).toFixed(0)}KB per question</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usage Stats */}
      {sizeUsage && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Approach Usage Stats
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Approaches:</span>
              <span className="ml-2 font-medium">
                {sizeUsage.approachCount}/{sizeUsage.maxApproaches}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Size Used:</span>
              <span className="ml-2 font-medium">
                {sizeUsage.totalUsedKB.toFixed(1)}KB/{sizeUsage.maxAllowedKB.toFixed(0)}KB
              </span>
            </div>
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">Storage:</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(sizeUsage.usagePercentage, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  {sizeUsage.usagePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approaches List */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Your Approaches ({approaches.length})
        </h4>
        
        {approaches.map((approach) => (
          <ApproachCard
            key={approach.id}
            approach={approach}
            onEdit={() => handleEditApproach(approach)}
            onDelete={() => handleDeleteApproach(approach.id)}
          />
        ))}
      </div>

      {/* Edit Approach Modal */}
      <EditApproachModal
        approach={editingApproach}
        isOpen={!!editingApproach}
        onClose={() => setEditingApproach(null)}
        onSave={handleSaveApproach}
        isLoading={updateApproachMutation.isPending}
      />
    </div>
  );
}