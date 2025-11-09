/**
 * TokenDisplay Component
 * 
 * Displays streaming text with smooth token-by-token animation.
 * Uses CSS transitions for flicker-free rendering.
 * 
 * @example
 * <TokenDisplay 
 *   text={streamingText}
 *   isStreaming={true}
 *   showCursor={true}
 *   animationDuration={50}
 * />
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export interface TokenDisplayProps {
  /** The text to display */
  text: string;
  
  /** Whether text is currently streaming */
  isStreaming?: boolean;
  
  /** Show animated cursor at end */
  showCursor?: boolean;
  
  /** Animation duration per token in ms */
  animationDuration?: number;
  
  /** Custom className */
  className?: string;
  
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TokenDisplay: React.FC<TokenDisplayProps> = ({
  text,
  isStreaming = false,
  showCursor = true,
  animationDuration = 50,
  className = '',
  onAnimationComplete,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const prevTextRef = useRef('');
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Animate text changes
  useEffect(() => {
    if (text === prevTextRef.current) return;
    
    // Clear previous animation
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // If text is shorter (e.g., reset), update immediately
    if (text.length < prevTextRef.current.length) {
      setDisplayText(text);
      prevTextRef.current = text;
      return;
    }
    
    // Animate new characters
    const newChars = text.slice(prevTextRef.current.length);
    let charIndex = 0;
    
    const animateNextChar = () => {
      if (charIndex < newChars.length) {
        setDisplayText(prev => prev + newChars[charIndex]);
        charIndex++;
        animationTimeoutRef.current = setTimeout(animateNextChar, animationDuration);
      } else {
        onAnimationComplete?.();
      }
    };
    
    animateNextChar();
    prevTextRef.current = text;
    
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [text, animationDuration, onAnimationComplete]);
  
  // Cursor blink animation
  useEffect(() => {
    if (showCursor && isStreaming) {
      cursorIntervalRef.current = setInterval(() => {
        setCursorVisible(prev => !prev);
      }, 530); // Blink every 530ms (classic terminal speed)
      
      return () => {
        if (cursorIntervalRef.current) {
          clearInterval(cursorIntervalRef.current);
        }
      };
    } else {
      setCursorVisible(false);
    }
  }, [showCursor, isStreaming]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <span className={`token-display ${className}`}>
      <span className="token-display__text">{displayText}</span>
      
      {showCursor && isStreaming && (
        <motion.span
          className="token-display__cursor"
          initial={{ opacity: 1 }}
          animate={{ opacity: cursorVisible ? 1 : 0 }}
          transition={{ duration: 0.1 }}
        >
          ▋
        </motion.span>
      )}
      
      <style jsx>{`
        .token-display {
          display: inline;
          position: relative;
        }
        
        .token-display__text {
          display: inline;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .token-display__cursor {
          display: inline;
          margin-left: 1px;
          color: currentColor;
          animation: blink 1.06s steps(2, start) infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
};

// ============================================================================
// OPTIMIZED VERSION (For large texts)
// ============================================================================

export interface OptimizedTokenDisplayProps extends TokenDisplayProps {
  /** Maximum characters before switching to non-animated mode */
  maxAnimatedChars?: number;
}

/**
 * Optimized version that stops animating after a certain length
 * to prevent performance issues with very long texts
 */
export const OptimizedTokenDisplay: React.FC<OptimizedTokenDisplayProps> = ({
  maxAnimatedChars = 1000,
  ...props
}) => {
  const shouldAnimate = props.text.length < maxAnimatedChars;
  
  if (!shouldAnimate) {
    // For very long text, just display it without animation
    return (
      <span className={`token-display ${props.className || ''}`}>
        {props.text}
        {props.showCursor && props.isStreaming && (
          <span className="token-display__cursor">▋</span>
        )}
      </span>
    );
  }
  
  return <TokenDisplay {...props} />;
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to track token display state
 */
export function useTokenDisplay(initialText: string = '') {
  const [text, setText] = useState(initialText);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const appendToken = (token: string) => {
    setText(prev => prev + token);
    setIsAnimating(true);
  };
  
  const clear = () => {
    setText('');
    setIsAnimating(false);
  };
  
  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };
  
  return {
    text,
    setText,
    appendToken,
    clear,
    isAnimating,
    handleAnimationComplete,
  };
}

