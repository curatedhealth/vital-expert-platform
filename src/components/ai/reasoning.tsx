'use client';

import { ChevronDown, ChevronUp, Loader2, Search, Brain, Zap, BarChart3, Target, CheckCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface ActionStep {
  id: string;
  text: string;
  completed: boolean;
  active: boolean;
}

interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  startTime: number;
  duration: number;
  currentStep: number;
  totalSteps: number;
  progress: number;
  actions: ActionStep[];
}

const ReasoningContext = React.createContext<ReasoningContextValue>({
  isStreaming: false,
  isOpen: false,
  setIsOpen: () => {},
  toggleOpen: () => {},
  startTime: 0,
  duration: 0,
  currentStep: 0,
  totalSteps: 5,
  progress: 0,
  actions: [],
});

interface ReasoningProps {
  children: React.ReactNode;
  isStreaming?: boolean;
  className?: string;
}

export function Reasoning({ children, isStreaming = false, className }: ReasoningProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [userManuallyOpened, setUserManuallyOpened] = React.useState(false);
  const [startTime] = React.useState(Date.now());
  const [duration, setDuration] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [totalSteps] = React.useState(5);
  const [progress, setProgress] = React.useState(0);

  // Define action steps
  const [actions, setActions] = React.useState<ActionStep[]>([
    { id: 'analyze', text: 'Analyzing your question and context...', completed: false, active: false },
    { id: 'domains', text: 'Detecting relevant knowledge domains...', completed: false, active: false },
    { id: 'select', text: 'Selecting the most appropriate expert agent...', completed: false, active: false },
    { id: 'prepare', text: 'Preparing specialized response...', completed: false, active: false },
    { id: 'found', text: 'Found 3 suitable agents. Please select the best one for your query:', completed: false, active: false },
  ]);

  // Auto-open when streaming starts
  React.useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
      // Start the action sequence
      setCurrentStep(0);
      setProgress(0);
      setActions(prev => prev.map((action, index) => ({
        ...action,
        completed: false,
        active: index === 0
      })));
    }
  }, [isStreaming]);

  // Simulate step progression
  React.useEffect(() => {
    if (!isStreaming) return;

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep < totalSteps) {
          setProgress((nextStep / totalSteps) * 100);
          setActions(prevActions => 
            prevActions.map((action, index) => ({
              ...action,
              completed: index < nextStep,
              active: index === nextStep
            }))
          );
          return nextStep;
        } else {
          setProgress(100);
          setActions(prevActions => 
            prevActions.map(action => ({
              ...action,
              completed: true,
              active: false
            }))
          );
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 800); // Progress every 800ms

    return () => clearInterval(stepInterval);
  }, [isStreaming, totalSteps]);

  // Update duration while streaming
  React.useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setDuration(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isStreaming, startTime]);

  // Auto-close when streaming completes (only if user hasn't manually opened it)
  React.useEffect(() => {
    if (!isStreaming && isOpen && !userManuallyOpened) {
      // Only auto-close if it was opened automatically (not manually by user)
      const timeout = setTimeout(() => {
        setIsOpen(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isStreaming, isOpen, userManuallyOpened]);

  // Manual toggle function
  const toggleOpen = React.useCallback(() => {
    setIsOpen(prev => {
      const newOpen = !prev;
      if (newOpen) {
        setUserManuallyOpened(true);
      }
      return newOpen;
    });
  }, []);

  return (
    <ReasoningContext.Provider
      value={{
        isStreaming,
        isOpen,
        setIsOpen,
        toggleOpen,
        startTime,
        duration,
        currentStep,
        totalSteps,
        progress,
        actions,
      }}
    >
      <div className={cn('border border-gray-200 rounded-lg bg-white', className)}>
        {children}
      </div>
    </ReasoningContext.Provider>
  );
}

interface ReasoningTriggerProps {
  title?: string;
  className?: string;
}

export function ReasoningTrigger({ title = 'I am thinking...', className }: ReasoningTriggerProps) {
  const { isStreaming, isOpen, toggleOpen, duration, progress } = React.useContext(ReasoningContext);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <button
      onClick={toggleOpen}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50',
        className
      )}
      aria-expanded={isOpen}
      aria-controls="reasoning-content"
    >
      <div className="flex items-center gap-3">
        {isStreaming ? (
          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-600" />
        )}
        <span className="text-gray-700 font-medium">
          {title}
        </span>
        {isStreaming && (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {Math.round(progress)}%
            </span>
          </div>
        )}
        {duration > 0 && (
          <span className="text-xs text-gray-500">
            {formatDuration(duration)}
          </span>
        )}
      </div>
      {isOpen ? (
        <ChevronUp className="h-4 w-4 text-gray-500" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-500" />
      )}
    </button>
  );
}

interface ReasoningContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ReasoningContent({ children, className }: ReasoningContentProps) {
  const { isOpen, actions } = React.useContext(ReasoningContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(0);

  React.useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          setHeight(entries[0].contentRect.height);
        }
      });

      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  const getStepIcon = (stepId: string, completed: boolean, active: boolean) => {
    if (completed) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (active) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
    
    switch (stepId) {
      case 'analyze':
        return <Search className="h-4 w-4 text-gray-400" />;
      case 'domains':
        return <Brain className="h-4 w-4 text-gray-400" />;
      case 'select':
        return <Zap className="h-4 w-4 text-gray-400" />;
      case 'prepare':
        return <BarChart3 className="h-4 w-4 text-gray-400" />;
      case 'found':
        return <Target className="h-4 w-4 text-gray-400" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div
      id="reasoning-content"
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
      style={{
        height: isOpen ? (height || 'auto') : 0,
      }}
    >
      <div ref={contentRef} className={cn('px-4 pb-4', className)}>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className={cn(
                'flex items-center gap-3 py-2',
                action.completed ? 'text-gray-700' : 
                action.active ? 'text-blue-600' : 'text-gray-500'
              )}
            >
              {getStepIcon(action.id, action.completed, action.active)}
              <span className={cn(
                'text-sm',
                action.completed ? 'font-medium' : 
                action.active ? 'font-medium' : 'font-normal'
              )}>
                {action.text}
              </span>
              {action.active && (
                <div className="flex items-center gap-1 ml-auto">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
