import { useState, useCallback } from 'react';

export interface ConversationBranch {
  id: string;
  parentMessageId: string;
  messages: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    agentType?: string;
  }>;
  title: string;
  createdAt: Date;
  isActive: boolean;
}

export interface ConversationTree {
  mainBranch: ConversationBranch;
  branches: ConversationBranch[];
  activeBranchId: string;
}

interface UseConversationBranchingOptions {
  onBranchCreated?: (branch: ConversationBranch) => void;
  onBranchSwitched?: (branchId: string) => void;
  onBranchMerged?: (sourceBranchId: string, targetBranchId: string) => void;
}

export function useConversationBranching(
  initialConversationId: string,
  options: UseConversationBranchingOptions = { /* TODO: implement */ }
) {
  const [conversationTree, setConversationTree] = useState<ConversationTree>(() => ({
    mainBranch: {
      id: 'main',
      parentMessageId: '',
      messages: [],
      title: 'Main Conversation',
      createdAt: new Date(),
      isActive: true
    },
    branches: [],
    activeBranchId: 'main'
  }));

    parentMessageId: string,
    initialMessage: string,
    title?: string
  ) => {

    const newBranch: ConversationBranch = {
      id: branchId,
      parentMessageId,
      messages: [
        {
          id: `msg_${Date.now()}`,
          content: initialMessage,
          role: 'user',
          timestamp: new Date()
        }
      ],
      title: title || `Branch from message ${parentMessageId.slice(-8)}`,
      createdAt: new Date(),
      isActive: false
    };

    setConversationTree(prev => {

        ...prev,
        branches: [...prev.branches, newBranch],
        activeBranchId: branchId
      };

      // Update active status
      if (prev.activeBranchId === 'main') {
        updated.mainBranch.isActive = false;
      } else {
        updated.branches = updated.branches.map(branch => ({
          ...branch,
          isActive: branch.id === branchId
        }));
      }

      newBranch.isActive = true;

      options.onBranchCreated?.(newBranch);
      options.onBranchSwitched?.(branchId);

      return updated;
    });

    return branchId;
  }, [options]);

    setConversationTree(prev => {
      // Update active status for all branches

        ...branch,
        isActive: branch.id === branchId
      }));

        ...prev.mainBranch,
        isActive: branchId === 'main'
      };

      options.onBranchSwitched?.(branchId);

      return {
        ...prev,
        mainBranch: updatedMainBranch,
        branches: updatedBranches,
        activeBranchId: branchId
      };
    });
  }, [options]);

    if (branchId === 'main') {
      // console.warn('Cannot delete main branch');
      return;
    }

    setConversationTree(prev => {

      // If deleting active branch, switch to main

      if (prev.activeBranchId === branchId) {
        newActiveBranchId = 'main';
        options.onBranchSwitched?.('main');
      }

      return {
        ...prev,
        branches: filteredBranches,
        activeBranchId: newActiveBranchId,
        mainBranch: {
          ...prev.mainBranch,
          isActive: newActiveBranchId === 'main'
        }
      };
    });
  }, [options]);

    setConversationTree(prev => {

      if (!sourceBranch) return prev;

        ? prev.mainBranch
        : prev.branches.find(b => b.id === targetBranchId);

      if (!targetBranch) return prev;

      // Merge messages from source to target

      if (targetBranchId === 'main') {
        // Remove source branch and update main

        options.onBranchMerged?.(sourceBranchId, targetBranchId);

        return {
          ...prev,
          mainBranch: {
            ...prev.mainBranch,
            messages: mergedMessages
          },
          branches: filteredBranches
        };
      } else {
        // Update target branch and remove source

          if (branch.id === targetBranchId) {
            return { ...branch, messages: mergedMessages };
          }
          return branch;
        }).filter(b => b.id !== sourceBranchId);

        options.onBranchMerged?.(sourceBranchId, targetBranchId);

        return {
          ...prev,
          branches: updatedBranches
        };
      }
    });
  }, [options]);

    if (conversationTree.activeBranchId === 'main') {
      return conversationTree.mainBranch;
    }
    return conversationTree.branches.find(b => b.id === conversationTree.activeBranchId) || conversationTree.mainBranch;
  }, [conversationTree]);

    content: string;
    role: 'user' | 'assistant';
    agentType?: string;
  }) => {

      id: `msg_${Date.now()}`,
      ...message,
      timestamp: new Date()
    };

    setConversationTree(prev => {
      if (prev.activeBranchId === 'main') {
        return {
          ...prev,
          mainBranch: {
            ...prev.mainBranch,
            messages: [...prev.mainBranch.messages, newMessage]
          }
        };
      } else {
        return {
          ...prev,
          branches: prev.branches.map(branch =>
            branch.id === prev.activeBranchId
              ? { ...branch, messages: [...branch.messages, newMessage] }
              : branch
          )
        };
      }
    });

    return newMessage;
  }, []);

  return {
    conversationTree,
    createBranch,
    switchToBranch,
    deleteBranch,
    mergeBranch,
    getActiveBranch,
    addMessageToActiveBranch,
    activeBranchId: conversationTree.activeBranchId,
  };
}