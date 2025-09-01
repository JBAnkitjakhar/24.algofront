// src/components/admin/SolutionModals.tsx - Solution management modals

"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  LightBulbIcon,
  EyeIcon,
  PlayIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import { SolutionRichTextEditor } from "./SolutionRichTextEditor";
import { MarkdownRenderer } from "../common/MarkdownRenderer";
import {
  useCreateSolution,
  useUpdateSolution,
  useDeleteSolution,
} from "@/hooks/useSolutionManagement";
import { useQuestions } from "@/hooks/useQuestionManagement";
import { SOLUTION_VALIDATION } from "@/constants";
import type {
  Solution,
  CreateSolutionRequest,
  UpdateSolutionRequest,
} from "@/types";
interface CreateSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId?: string;
}

export function CreateSolutionModal({
  isOpen,
  onClose,
  questionId,
}: CreateSolutionModalProps) {
  const [formData, setFormData] = useState<CreateSolutionRequest>({
    content: "",
    codeSnippet: undefined,
    driveLink: undefined,
    youtubeLink: undefined,
    imageUrls: [],
    visualizerFileIds: [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(questionId || "");

  const { data: questionsData } = useQuestions({ size: 100 }); // Get all questions for dropdown
  const createSolutionMutation = useCreateSolution();

  const questions = questionsData?.content || [];

  const handleContentChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  }, []);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!selectedQuestionId) {
      errors.push("Please select a question");
    }

    if (!formData.content.trim()) {
      errors.push("Solution content is required");
    } else {
      if (formData.content.trim().length < SOLUTION_VALIDATION.CONTENT_MIN_LENGTH) {
        errors.push(
          `Content must be at least ${SOLUTION_VALIDATION.CONTENT_MIN_LENGTH} characters long`
        );
      }
      if (formData.content.trim().length > SOLUTION_VALIDATION.CONTENT_MAX_LENGTH) {
        errors.push(
          `Content must be less than ${SOLUTION_VALIDATION.CONTENT_MAX_LENGTH} characters`
        );
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submissionData = {
      ...formData,
    };

    setErrors([]);
    createSolutionMutation.mutate(
      { questionId: selectedQuestionId, request: submissionData },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setFormData({
      content: "",
      codeSnippet: undefined,
      driveLink: undefined,
      youtubeLink: undefined,
      imageUrls: [],
      visualizerFileIds: [],
    });
    setErrors([]);
    setShowPreview(false);
    setSelectedQuestionId(questionId || "");
    onClose();
  };

  const updateFormData = <T extends keyof CreateSolutionRequest>(
    field: T,
    value: CreateSolutionRequest[T]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Create Solution
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium ${
                        showPreview
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {showPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-600"
                      onClick={handleClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className={`grid ${showPreview ? "grid-cols-2 gap-6" : "grid-cols-1"}`}>
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Question Selection */}
                      <div>
                        <label
                          htmlFor="question"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Select Question
                        </label>
                        <select
                          id="question"
                          value={selectedQuestionId}
                          onChange={(e) => setSelectedQuestionId(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          disabled={!!questionId} // Disable if questionId was provided
                        >
                          <option value="">Select a question</option>
                          {questions.map((question) => (
                            <option key={question.id} value={question.id}>
                              {question.title} ({question.categoryName})
                            </option>
                          ))}
                        </select>
                        {selectedQuestion && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                            <strong>Selected:</strong> {selectedQuestion.title} • {selectedQuestion.categoryName} • {selectedQuestion.level}
                          </div>
                        )}
                      </div>

                      {/* Solution Rich Text Editor */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Solution Content
                        </label>
                        <SolutionRichTextEditor
                          textContent={formData.content}
                          onTextContentChange={handleContentChange}
                          codeSnippet={formData.codeSnippet}
                          onCodeSnippetChange={(snippet) => updateFormData("codeSnippet", snippet)}
                          youtubeLink={formData.youtubeLink}
                          onYoutubeLinkChange={(link) => updateFormData("youtubeLink", link)}
                          driveLink={formData.driveLink}
                          onDriveLinkChange={(link) => updateFormData("driveLink", link)}
                          uploadedImages={formData.imageUrls || []}
                          onImagesChange={(images) => updateFormData("imageUrls", images)}
                          visualizerFileIds={formData.visualizerFileIds || []}
                          onVisualizerFileIdsChange={(fileIds) => updateFormData("visualizerFileIds", fileIds)}
                          placeholder="Explain your solution approach, algorithm, and implementation details..."
                          maxLength={SOLUTION_VALIDATION.CONTENT_MAX_LENGTH}
                        />
                      </div>

                      {errors.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                          <ul className="text-sm text-red-600 space-y-1">
                            {errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={handleClose}
                          disabled={createSolutionMutation.isPending}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={createSolutionMutation.isPending}
                        >
                          {createSolutionMutation.isPending
                            ? "Creating..."
                            : "Create Solution"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {showPreview && (
                    <div className="border-l border-gray-200 pl-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Preview
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                        {selectedQuestion && (
                          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <h2 className="font-semibold text-blue-900">
                              Solution for: {selectedQuestion.title}
                            </h2>
                            <p className="text-sm text-blue-700">
                              {selectedQuestion.categoryName} • {selectedQuestion.level}
                            </p>
                          </div>
                        )}

                        {formData.content ? (
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-700 mb-2">Explanation</h3>
                              <MarkdownRenderer content={formData.content} />
                            </div>

                            {formData.codeSnippet && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Code Solution</h3>
                                <div className="bg-gray-900 rounded-lg overflow-hidden">
                                  <div className="bg-gray-800 px-4 py-2 text-xs text-gray-300 font-medium flex items-center justify-between">
                                    <span>{formData.codeSnippet.language.charAt(0).toUpperCase() + formData.codeSnippet.language.slice(1)}</span>
                                    <span className="text-gray-400">{formData.codeSnippet.description}</span>
                                  </div>
                                  <pre className="p-4 overflow-x-auto">
                                    <code className="text-sm text-gray-100 font-mono whitespace-pre">
                                      {formData.codeSnippet.code}
                                    </code>
                                  </pre>
                                </div>
                              </div>
                            )}

                            {(formData.youtubeLink || formData.driveLink) && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Resources</h3>
                                <div className="space-y-2">
                                  {formData.youtubeLink && (
                                    <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded">
                                      <PlayIcon className="h-4 w-4 text-red-600 mr-2" />
                                      <span className="text-sm text-red-800">YouTube Video</span>
                                    </div>
                                  )}
                                  {formData.driveLink && (
                                    <div className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded">
                                      <FolderOpenIcon className="h-4 w-4 text-blue-600 mr-2" />
                                      <span className="text-sm text-blue-800">Google Drive Resource</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">
                            Preview will appear here as you add content...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface EditSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: Solution;
}

export function EditSolutionModal({
  isOpen,
  onClose,
  solution,
}: EditSolutionModalProps) {
  const [formData, setFormData] = useState<UpdateSolutionRequest>({
    content: solution.content,
    codeSnippet: solution.codeSnippet,
    driveLink: solution.driveLink,
    youtubeLink: solution.youtubeLink,
    imageUrls: solution.imageUrls || [],
    visualizerFileIds: solution.visualizerFileIds || [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const updateSolutionMutation = useUpdateSolution();

  useEffect(() => {
    setFormData({
      content: solution.content,
      codeSnippet: solution.codeSnippet,
      driveLink: solution.driveLink,
      youtubeLink: solution.youtubeLink,
      imageUrls: solution.imageUrls || [],
      visualizerFileIds: solution.visualizerFileIds || [],
    });
  }, [solution]);

  const handleContentChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  }, []);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.content.trim()) {
      errors.push("Solution content is required");
    } else {
      if (formData.content.trim().length < SOLUTION_VALIDATION.CONTENT_MIN_LENGTH) {
        errors.push(
          `Content must be at least ${SOLUTION_VALIDATION.CONTENT_MIN_LENGTH} characters long`
        );
      }
      if (formData.content.trim().length > SOLUTION_VALIDATION.CONTENT_MAX_LENGTH) {
        errors.push(
          `Content must be less than ${SOLUTION_VALIDATION.CONTENT_MAX_LENGTH} characters`
        );
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const hasChanges =
      formData.content !== solution.content ||
      JSON.stringify(formData.codeSnippet) !== JSON.stringify(solution.codeSnippet) ||
      formData.driveLink !== solution.driveLink ||
      formData.youtubeLink !== solution.youtubeLink ||
      JSON.stringify(formData.visualizerFileIds) !== JSON.stringify(solution.visualizerFileIds);

    if (!hasChanges) {
      setErrors(["No changes detected"]);
      return;
    }

    const submissionData = {
      ...formData,
    };

    setErrors([]);
    updateSolutionMutation.mutate(
      { id: solution.id, request: submissionData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setFormData({
      content: solution.content,
      codeSnippet: solution.codeSnippet,
      driveLink: solution.driveLink,
      youtubeLink: solution.youtubeLink,
      imageUrls: solution.imageUrls || [],
      visualizerFileIds: solution.visualizerFileIds || [],
    });
    setErrors([]);
    setShowPreview(false);
    onClose();
  };

  const updateFormData = <T extends keyof UpdateSolutionRequest>(
    field: T,
    value: UpdateSolutionRequest[T]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <PencilIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Edit Solution
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium ${
                        showPreview
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {showPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-600"
                      onClick={handleClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className={`grid ${showPreview ? "grid-cols-2 gap-6" : "grid-cols-1"}`}>
                  <div className="space-y-6">
                    {/* Question Info */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                      <div className="text-sm font-medium text-gray-900">
                        Question: {solution.questionTitle}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Created {new Date(solution.createdAt).toLocaleDateString()} by {solution.createdByName}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Solution Rich Text Editor */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Solution Content
                        </label>
                        <SolutionRichTextEditor
                          textContent={formData.content}
                          onTextContentChange={handleContentChange}
                          codeSnippet={formData.codeSnippet}
                          onCodeSnippetChange={(snippet) => updateFormData("codeSnippet", snippet)}
                          youtubeLink={formData.youtubeLink}
                          onYoutubeLinkChange={(link) => updateFormData("youtubeLink", link)}
                          driveLink={formData.driveLink}
                          onDriveLinkChange={(link) => updateFormData("driveLink", link)}
                          uploadedImages={formData.imageUrls || []}
                          onImagesChange={(images) => updateFormData("imageUrls", images)}
                          visualizerFileIds={formData.visualizerFileIds || []}
                          onVisualizerFileIdsChange={(fileIds) => updateFormData("visualizerFileIds", fileIds)}
                          solutionId={solution.id}
                          placeholder="Explain your solution approach, algorithm, and implementation details..."
                          maxLength={SOLUTION_VALIDATION.CONTENT_MAX_LENGTH}
                        />
                      </div>

                      {errors.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                          <ul className="text-sm text-red-600 space-y-1">
                            {errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={handleClose}
                          disabled={updateSolutionMutation.isPending}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updateSolutionMutation.isPending}
                        >
                          {updateSolutionMutation.isPending
                            ? "Updating..."
                            : "Update Solution"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {showPreview && (
                    <div className="border-l border-gray-200 pl-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Preview
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <h2 className="font-semibold text-blue-900">
                            Solution for: {solution.questionTitle}
                          </h2>
                        </div>

                        {formData.content ? (
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-700 mb-2">Explanation</h3>
                              <MarkdownRenderer content={formData.content} />
                            </div>

                            {formData.codeSnippet && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Code Solution</h3>
                                <div className="bg-gray-900 rounded-lg overflow-hidden">
                                  <div className="bg-gray-800 px-4 py-2 text-xs text-gray-300 font-medium flex items-center justify-between">
                                    <span>{formData.codeSnippet.language.charAt(0).toUpperCase() + formData.codeSnippet.language.slice(1)}</span>
                                    <span className="text-gray-400">{formData.codeSnippet.description}</span>
                                  </div>
                                  <pre className="p-4 overflow-x-auto">
                                    <code className="text-sm text-gray-100 font-mono whitespace-pre">
                                      {formData.codeSnippet.code}
                                    </code>
                                  </pre>
                                </div>
                              </div>
                            )}

                            {(formData.youtubeLink || formData.driveLink) && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Resources</h3>
                                <div className="space-y-2">
                                  {formData.youtubeLink && (
                                    <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded">
                                      <PlayIcon className="h-4 w-4 text-red-600 mr-2" />
                                      <span className="text-sm text-red-800">YouTube Video</span>
                                    </div>
                                  )}
                                  {formData.driveLink && (
                                    <div className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded">
                                      <FolderOpenIcon className="h-4 w-4 text-blue-600 mr-2" />
                                      <span className="text-sm text-blue-800">Google Drive Resource</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">
                            Preview will appear here as you add content...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface DeleteSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: Solution;
}

export function DeleteSolutionModal({
  isOpen,
  onClose,
  solution,
}: DeleteSolutionModalProps) {
  const deleteSolutionMutation = useDeleteSolution();

  const handleDelete = () => {
    deleteSolutionMutation.mutate(solution.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Delete Solution
                  </DialogTitle>

                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this solution for{" "}
                      <span className="font-medium text-gray-900">
                        {solution.questionTitle}
                      </span>
                      ?
                    </p>

                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800 font-medium">
                        Warning: This will permanently delete:
                      </p>
                      <ul className="mt-2 text-sm text-red-700 space-y-1">
                        <li>• The solution content and explanation</li>
                        <li>• All attached images and code snippets</li>
                        {solution.visualizerFileIds && solution.visualizerFileIds.length > 0 && (
                          <li>• {solution.visualizerFileIds.length} HTML visualizer file{solution.visualizerFileIds.length !== 1 ? 's' : ''}</li>
                        )}
                        {solution.youtubeLink && <li>• YouTube video link</li>}
                        {solution.driveLink && <li>• Google Drive link</li>}
                      </ul>
                      <p className="mt-2 text-xs text-red-600">
                        This action cannot be undone.
                      </p>
                    </div>

                    <div className="mt-3 p-2 bg-gray-50 rounded border">
                      <div className="flex items-center text-sm text-gray-600">
                        <LightBulbIcon className="h-4 w-4 mr-1" />
                        <span className="font-medium">Created:</span>
                        <span className="ml-1">{new Date(solution.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <span className="font-medium">By:</span>
                        <span className="ml-1">{solution.createdByName}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <span className="font-medium">Content:</span>
                        <span className="ml-1">{solution.content.length} characters</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                    disabled={deleteSolutionMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDelete}
                    disabled={deleteSolutionMutation.isPending}
                  >
                    {deleteSolutionMutation.isPending
                      ? "Deleting..."
                      : "Delete Solution"}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}