'use client';

import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import {
  MessageSquare,
  Reply,
  CheckCircle,
  MoreHorizontal,
  Trash2,
  Edit,
  X,
  Send,
  AtSign,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type AnnotationStatus = 'open' | 'resolved' | 'pending';

export interface AnnotationUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface AnnotationReply {
  id: string;
  author: AnnotationUser;
  content: string;
  createdAt: Date;
  mentions?: string[];
}

export interface Annotation {
  id: string;
  author: AnnotationUser;
  content: string;
  createdAt: Date;
  status: AnnotationStatus;
  position: {
    start: number;
    end: number;
  };
  selectedText: string;
  replies: AnnotationReply[];
  mentions?: string[];
}

export interface VitalAnnotationLayerProps {
  /** All annotations */
  annotations: Annotation[];
  /** Currently selected annotation ID */
  selectedId?: string;
  /** Current user */
  currentUser: AnnotationUser;
  /** Available users for @mentions */
  availableUsers?: AnnotationUser[];
  /** Whether annotations are editable */
  editable?: boolean;
  /** Callback when annotation selected */
  onSelect?: (annotation: Annotation) => void;
  /** Callback when annotation created */
  onCreate?: (position: { start: number; end: number }, selectedText: string, content: string) => void;
  /** Callback when annotation updated */
  onUpdate?: (id: string, content: string) => void;
  /** Callback when annotation deleted */
  onDelete?: (id: string) => void;
  /** Callback when annotation resolved */
  onResolve?: (id: string) => void;
  /** Callback when reply added */
  onReply?: (annotationId: string, content: string) => void;
  /** Custom class name */
  className?: string;
}

/**
 * VitalAnnotationLayer - Team Collaboration
 * 
 * Google Docs-style commenting anchored to specific text in an Artifact.
 * Features: Floating comments, @mentions, resolve status.
 * 
 * @example
 * ```tsx
 * <VitalAnnotationLayer
 *   annotations={documentAnnotations}
 *   currentUser={currentUser}
 *   availableUsers={teamMembers}
 *   onReply={(id, content) => addReply(id, content)}
 *   onResolve={(id) => resolveAnnotation(id)}
 * />
 * ```
 */
export function VitalAnnotationLayer({
  annotations,
  selectedId,
  currentUser,
  availableUsers = [],
  editable = true,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  onResolve,
  onReply,
  className,
}: VitalAnnotationLayerProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  const handleReply = useCallback((annotationId: string) => {
    if (!replyContent.trim()) return;
    onReply?.(annotationId, replyContent);
    setReplyContent('');
    setReplyingTo(null);
  }, [replyContent, onReply]);

  const handleUpdate = useCallback((id: string) => {
    if (!editContent.trim()) return;
    onUpdate?.(id, editContent);
    setEditingId(null);
    setEditContent('');
  }, [editContent, onUpdate]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderAnnotation = (annotation: Annotation) => {
    const isSelected = annotation.id === selectedId;
    const isEditing = editingId === annotation.id;
    const isReplying = replyingTo === annotation.id;

    return (
      <div
        key={annotation.id}
        className={cn(
          'rounded-lg border bg-card transition-all',
          isSelected && 'ring-2 ring-primary',
          annotation.status === 'resolved' && 'opacity-60'
        )}
        onClick={() => onSelect?.(annotation)}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-3 pb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={annotation.author.avatar} />
            <AvatarFallback>
              {annotation.author.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-medium text-sm">{annotation.author.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatTime(annotation.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {annotation.status === 'resolved' && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Resolved
                  </Badge>
                )}

                {editable && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {annotation.status !== 'resolved' && onResolve && (
                        <DropdownMenuItem onClick={() => onResolve(annotation.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </DropdownMenuItem>
                      )}
                      {annotation.author.id === currentUser.id && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            setEditingId(annotation.id);
                            setEditContent(annotation.content);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete?.(annotation.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Selected Text Quote */}
            <div className="mt-2 px-3 py-1.5 bg-muted/50 border-l-2 border-primary rounded text-xs text-muted-foreground italic">
              "{annotation.selectedText}"
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-3 pb-3">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] text-sm"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleUpdate(annotation.id)}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{annotation.content}</p>
          )}
        </div>

        {/* Replies */}
        {annotation.replies.length > 0 && (
          <div className="border-t">
            <ScrollArea className="max-h-[200px]">
              {annotation.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-2 p-3 border-b last:border-b-0">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reply.author.avatar} />
                    <AvatarFallback>
                      {reply.author.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{reply.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}

        {/* Reply Input */}
        {editable && annotation.status !== 'resolved' && (
          <div className="border-t p-2">
            {isReplying ? (
              <div className="space-y-2">
                <div className="relative">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[60px] text-sm pr-8"
                    autoFocus
                  />
                  <Popover open={showMentions} onOpenChange={setShowMentions}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6"
                      >
                        <AtSign className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="end">
                      {availableUsers.map((user) => (
                        <Button
                          key={user.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setReplyContent(prev => prev + `@${user.name} `);
                            setShowMentions(false);
                          }}
                        >
                          <Avatar className="h-5 w-5 mr-2">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          {user.name}
                        </Button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleReply(annotation.id)}>
                    <Send className="h-3 w-3 mr-2" />
                    Reply
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setReplyingTo(annotation.id)}
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply...
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const openAnnotations = annotations.filter(a => a.status !== 'resolved');
  const resolvedAnnotations = annotations.filter(a => a.status === 'resolved');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Comments</h3>
          <Badge variant="outline">{openAnnotations.length} open</Badge>
        </div>
      </div>

      {/* Open Annotations */}
      <div className="space-y-3">
        {openAnnotations.map(renderAnnotation)}
      </div>

      {/* Resolved Annotations */}
      {resolvedAnnotations.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">
            Resolved ({resolvedAnnotations.length})
          </p>
          {resolvedAnnotations.map(renderAnnotation)}
        </div>
      )}

      {annotations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet</p>
          <p className="text-xs">Select text to add a comment</p>
        </div>
      )}
    </div>
  );
}

export default VitalAnnotationLayer;
