'use client';

import { useEffect } from 'react';
import { useWorkflowEditorStore } from '@/lib/stores/workflow-editor-store';
import { useReactFlow } from 'reactflow';

export function useKeyboardShortcuts() {
  const {
    undo,
    redo,
    copy,
    cut,
    paste,
    deleteNodes,
    selectedNodes,
    saveWorkflow,
  } = useWorkflowEditorStore();
  
  const { fitView } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Cmd/Ctrl + Z - Undo
      if (cmdOrCtrl && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }

      // Cmd/Ctrl + Shift + Z - Redo
      if (cmdOrCtrl && event.key === 'z' && event.shiftKey) {
        event.preventDefault();
        redo();
      }

      // Cmd/Ctrl + Y - Redo (alternative)
      if (cmdOrCtrl && event.key === 'y') {
        event.preventDefault();
        redo();
      }

      // Cmd/Ctrl + C - Copy
      if (cmdOrCtrl && event.key === 'c' && selectedNodes.length > 0) {
        event.preventDefault();
        copy();
      }

      // Cmd/Ctrl + X - Cut
      if (cmdOrCtrl && event.key === 'x' && selectedNodes.length > 0) {
        event.preventDefault();
        cut();
      }

      // Cmd/Ctrl + V - Paste
      if (cmdOrCtrl && event.key === 'v') {
        event.preventDefault();
        paste();
      }

      // Delete/Backspace - Delete selected nodes
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodes.length > 0) {
        event.preventDefault();
        deleteNodes(selectedNodes);
      }

      // Cmd/Ctrl + S - Save
      if (cmdOrCtrl && event.key === 's') {
        event.preventDefault();
        saveWorkflow();
      }

      // Cmd/Ctrl + 0 - Fit view
      if (cmdOrCtrl && event.key === '0') {
        event.preventDefault();
        fitView({ padding: 0.2, duration: 300 });
      }

      // Cmd/Ctrl + A - Select all
      if (cmdOrCtrl && event.key === 'a') {
        event.preventDefault();
        // TODO: Implement select all
      }

      // Escape - Clear selection
      if (event.key === 'Escape') {
        event.preventDefault();
        useWorkflowEditorStore.getState().clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copy, cut, paste, deleteNodes, selectedNodes, saveWorkflow, fitView]);
}

