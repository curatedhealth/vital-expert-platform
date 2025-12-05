/**
 * Enhanced Prompt Input Component
 * Features inline toggles, model selector, and attachment support
 * Similar to Claude.ai and shadcn AI components
 */

import React, { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  X,
  Zap,
  Bot,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Brain,
  Wrench,
  Target,
} from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;

  // Model selection
  selectedModel: string;
  onModelChange: (model: string) => void;
  models?: Array<{ value: string; label: string; group?: string }>;

  // Toggles
  isAutomatic: boolean;
  onAutomaticChange: (value: boolean) => void;
  isAutonomous: boolean;
  onAutonomousChange: (value: boolean) => void;

  // Attachments
  attachments?: File[];
  onAttachmentsChange?: (files: File[]) => void;

  // Token count
  tokenCount?: number;

  // Retrieval & tools
  enableRAG?: boolean;
  onEnableRAGChange?: (value: boolean) => void;
  enableTools?: boolean;
  onEnableToolsChange?: (value: boolean) => void;
  availableTools?: string[];
  selectedTools?: string[];
  onSelectedToolsChange?: (tools: string[]) => void;
  availableRagDomains?: string[];
  selectedRagDomains?: string[];
  onSelectedRagDomainsChange?: (domains: string[]) => void;
  
  // LangGraph (NEW)
  useLangGraph?: boolean;
  onUseLangGraphChange?: (value: boolean) => void;

  // Define Goal button for autonomous mode (Scenario 3)
  onDefineGoalClick?: () => void;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = 'How can I help you today?',
  textareaRef,
  selectedModel,
  onModelChange,
  models = [
    { value: 'gpt-4', label: 'GPT-4 Turbo', group: 'OpenAI' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', group: 'OpenAI' },
    { value: 'llama-medical', label: 'Llama 3.2 Medical', group: 'Medical AI' },
    { value: 'llama-clinical', label: 'Llama 3.2 Clinical', group: 'Medical AI' },
    { value: 'biogpt', label: 'BioGPT Research', group: 'Medical AI' },
  ],
  isAutomatic,
  onAutomaticChange,
  isAutonomous,
  onAutonomousChange,
  attachments = [],
  onAttachmentsChange,
  tokenCount,
  enableRAG = false,
  onEnableRAGChange,
  enableTools = true,
  onEnableToolsChange,
  availableTools = [],
  selectedTools = [],
  onSelectedToolsChange,
  availableRagDomains = [],
  selectedRagDomains = [],
  onSelectedRagDomainsChange,
  useLangGraph = false,
  onUseLangGraphChange,
  onDefineGoalClick,
}: PromptInputProps) {
  const fallbackTextareaRef = useRef<HTMLTextAreaElement>(null);
  const internalTextareaRef = textareaRef ?? fallbackTextareaRef;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showRagDropdown, setShowRagDropdown] = useState(false);

  useEffect(() => {
    if (!availableTools.length) {
      setShowToolsDropdown(false);
    }
  }, [availableTools]);

  useEffect(() => {
    if (!enableRAG) {
      setShowRagDropdown(false);
    }
  }, [enableRAG]);

  useEffect(() => {
    if (!availableRagDomains.length) {
      setShowRagDropdown(false);
    }
  }, [availableRagDomains]);

  const formattedTools = Array.from(new Set(availableTools)).sort((a, b) => a.localeCompare(b));
  const formattedSelectedTools = Array.isArray(selectedTools) ? selectedTools : [];

  const formattedRagDomains = Array.from(new Set(availableRagDomains)).sort((a, b) => a.localeCompare(b));
  const formattedSelectedRagDomains = Array.isArray(selectedRagDomains)
    ? selectedRagDomains.filter((domain) => formattedRagDomains.includes(domain))
    : [];

  const formatLabel = (value: string) =>
    value
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');

  const handleRagSelection = (domain: string) => {
    if (!onSelectedRagDomainsChange) return;

    const current = new Set(formattedSelectedRagDomains);
    if (current.has(domain)) {
      current.delete(domain);
    } else {
      current.add(domain);
    }

    const next = Array.from(current);
    onSelectedRagDomainsChange(next);

    if (next.length === 0 && enableRAG && onEnableRAGChange) {
      onEnableRAGChange(false);
    }
  };

  const handleToolSelection = (toolName: string) => {
    if (!onSelectedToolsChange) return;

    const current = new Set(formattedSelectedTools);
    if (current.has(toolName)) {
      current.delete(toolName);
    } else {
      current.add(toolName);
    }
    onSelectedToolsChange(Array.from(current));
  };

  const handleToolsButtonClick = () => {
    if (!formattedTools.length) {
      return;
    }
    if (!enableTools && onEnableToolsChange) {
      onEnableToolsChange(true);
    }
    setShowToolsDropdown((prev) => !prev);
  };

  const handleRagButtonClick = () => {
    if (!formattedRagDomains.length) {
      onEnableRAGChange?.(!enableRAG);
      return;
    }

    if (!enableRAG && onEnableRAGChange) {
      onEnableRAGChange(true);
    }
    setShowRagDropdown((prev) => !prev);
  };

  // Auto-resize textarea
  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  // Handle enter key
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (onAttachmentsChange) {
      onAttachmentsChange([...attachments, ...files]);
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    if (onAttachmentsChange) {
      onAttachmentsChange(attachments.filter((_, i) => i !== index));
    }
  };

  // Get current model label
  const currentModel = models.find(m => m.value === selectedModel);

  // Group models
  const groupedModels = models.reduce((acc, model) => {
    const group = model.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(model);
    return acc;
  }, {} as Record<string, typeof models>);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-2 px-1"
          >
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs border border-blue-200 dark:border-blue-800"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                )}
                <span className="text-neutral-700 dark:text-neutral-300 max-w-[150px] truncate">
                  {file.name}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  ({Math.round(file.size / 1024)}KB)
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-neutral-500" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Container */}
      <div className="relative">
        {/* Top Controls Bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 rounded-t-2xl">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-300 dark:border-neutral-600"
            >
              <Sparkles className="w-3 h-3" />
              {currentModel?.label || 'Select Model'}
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Model Dropdown */}
            <AnimatePresence>
              {showModelDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowModelDropdown(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-canvas-surface dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-20 overflow-hidden"
                  >
                    {Object.entries(groupedModels).map(([group, groupModels]) => (
                      <div key={group}>
                        <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900">
                          {group}
                        </div>
                        {groupModels.map((model) => (
                          <button
                            key={model.value}
                            onClick={() => {
                              onModelChange(model.value);
                              setShowModelDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                              selectedModel === model.value
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            {model.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Separator */}
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-600" />

          {/* Automatic Toggle */}
          <button
            onClick={() => onAutomaticChange(!isAutomatic)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              isAutomatic
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
            }`}
          >
            <Zap className="w-3 h-3" />
            Automatic
          </button>

          {/* Autonomous Toggle */}
          <button
            onClick={() => onAutonomousChange(!isAutonomous)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              isAutonomous
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
            }`}
          >
            <Bot className="w-3 h-3" />
            Autonomous
          </button>

          {/* Define Goal Button - Appears when autonomous mode is active (Scenario 3) */}
          {isAutonomous && onDefineGoalClick && (
            <button
              onClick={onDefineGoalClick}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-sm animate-pulse hover:animate-none"
              title="Define your goal for autonomous execution"
            >
              <Target className="w-3 h-3" />
              Define Goal
            </button>
          )}

          {/* LangGraph Toggle (NEW) */}
          {onUseLangGraphChange && (
            <button
              onClick={() => onUseLangGraphChange(!useLangGraph)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all border ${
                useLangGraph
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-600 hover:from-emerald-600 hover:to-teal-600 shadow-sm'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-600'
              }`}
              title={useLangGraph ? 'LangGraph: ON - Workflow orchestration with state management' : 'LangGraph: OFF - Standard mode'}
            >
              <Sparkles className="w-3 h-3" />
              LangGraph
            </button>
          )}

          {/* RAG Dropdown */}
          {onEnableRAGChange && (
            formattedRagDomains.length > 0 ? (
              <div className="relative">
                <button
                  onClick={handleRagButtonClick}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    enableRAG
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                  }`}
                >
                  <Brain className="w-3 h-3" />
                  RAG
                  {formattedSelectedRagDomains.length > 0 && (
                    <span className="text-[10px] font-semibold">({formattedSelectedRagDomains.length})</span>
                  )}
                  <ChevronDown className="w-3 h-3" />
                </button>

                <AnimatePresence>
                  {showRagDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowRagDropdown(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-1 w-64 bg-canvas-surface dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-40 overflow-hidden"
                      >
                        <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
                          <button
                            onClick={() => onEnableRAGChange?.(!enableRAG)}
                            className="w-full flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-200"
                          >
                            <span>Enable RAG</span>
                            <span
                              className={`inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                                enableRAG ? 'bg-emerald-500' : 'bg-neutral-400'
                              }`}
                            >
                              <span
                                className={`h-3 w-3 rounded-full bg-canvas-surface transition-transform ${
                                  enableRAG ? 'translate-x-4' : 'translate-x-1'
                                }`}
                              />
                            </span>
                          </button>
                        </div>

                        <div className="max-h-48 overflow-y-auto py-1">
                          {formattedRagDomains.map((domain) => {
                            const isSelected = formattedSelectedRagDomains.includes(domain);
                            return (
                              <button
                                key={domain}
                                onClick={() => handleRagSelection(domain)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                  isSelected ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''
                                }`}
                              >
                                <span className="text-neutral-700 dark:text-neutral-200">
                                  {formatLabel(domain)}
                                </span>
                                <span
                                  className={`h-3 w-3 rounded-full border ${
                                    isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-400'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => onEnableRAGChange(!enableRAG)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  enableRAG
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                <Brain className="w-3 h-3" />
                RAG
              </button>
            )
          )}

          {/* Tools Dropdown */}
          {onEnableToolsChange && (
            <div className="relative">
              <button
                onClick={handleToolsButtonClick}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  enableTools
                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                } ${!formattedTools.length ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={!formattedTools.length}
              >
                <Wrench className="w-3 h-3" />
                Tools
                {formattedSelectedTools.length > 0 && (
                  <span className="text-[10px] font-semibold">({formattedSelectedTools.length})</span>
                )}
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {showToolsDropdown && formattedTools.length > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowToolsDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-canvas-surface dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-40 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
                        <button
                          onClick={() => onEnableToolsChange?.(!enableTools)}
                          className="w-full flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-200"
                        >
                          <span>Enable tools</span>
                          <span
                            className={`inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                              enableTools ? 'bg-teal-500' : 'bg-neutral-400'
                            }`}
                          >
                            <span
                              className={`h-3 w-3 rounded-full bg-canvas-surface transition-transform ${
                                enableTools ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </span>
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto py-1">
                        {formattedTools.map((tool) => {
                          const isSelected = formattedSelectedTools.includes(tool);
                          return (
                            <button
                              key={tool}
                              onClick={() => handleToolSelection(tool)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                isSelected ? 'bg-teal-50 dark:bg-teal-900/30' : ''
                              }`}
                            >
                              <span className="text-neutral-700 dark:text-neutral-200">
                                {formatLabel(tool)}
                              </span>
                              <span
                                className={`h-3 w-3 rounded-full border ${
                                  isSelected ? 'bg-teal-500 border-teal-500' : 'border-neutral-400'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Token Count */}
          {tokenCount !== undefined && (
            <>
              <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-600 ml-auto" />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                ~{tokenCount} tokens
              </span>
            </>
          )}
        </div>

        {/* Textarea */}
        <div className="relative bg-canvas-surface dark:bg-neutral-800">
          <textarea
            ref={internalTextareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-3 pr-24 bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none resize-none text-sm"
            style={{
              minHeight: '52px',
              maxHeight: '200px',
            }}
          />

          {/* Bottom Right Controls */}
          <div className="absolute right-3 bottom-3 flex items-center gap-1">
            {/* Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            </button>

            {/* Send Button */}
            <button
              onClick={onSubmit}
              disabled={!value.trim() || isLoading}
              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-neutral-200 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom border */}
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />
      </div>
    </div>
  );
}
