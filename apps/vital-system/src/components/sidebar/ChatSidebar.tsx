'use client';

import React, { useState } from 'react';

import { AgentLibrary } from './AgentLibrary';
import { ConversationList } from './ConversationList';
import { QuickSettings } from './QuickSettings';

interface ChatSidebarProps {
  className?: string;
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversations' | 'agents' | 'settings'>('conversations');

    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`bg-card border-r border-border transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    } ${className}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-foreground">VITAL Path</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'conversations'
                  ? 'text-primary border-b-2 border-primary bg-muted/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'agents'
                  ? 'text-primary border-b-2 border-primary bg-muted/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Agents
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-primary border-b-2 border-primary bg-muted/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'conversations' && <ConversationList />}
            {activeTab === 'agents' && <AgentLibrary />}
            {activeTab === 'settings' && <QuickSettings />}
          </div>
        </>
      )}

      {/* Collapsed State - Icon Only */}
      {isCollapsed && (
        <div className="flex flex-col items-center py-4 space-y-4">
          <button
            onClick={() => {
              setIsCollapsed(false);
              setActiveTab('conversations');
            }}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Conversations"
          >
            💬
          </button>
          <button
            onClick={() => {
              setIsCollapsed(false);
              setActiveTab('agents');
            }}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            title="AI Agents"
          >
            🤖
          </button>
          <button
            onClick={() => {
              setIsCollapsed(false);
              setActiveTab('settings');
            }}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      )}
    </aside>
  );
}