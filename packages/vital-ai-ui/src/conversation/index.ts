/**
 * VITAL AI UI - Core Conversation Components (Domain A)
 * 
 * Components for chat interface, message display, and user input.
 * 13 components total:
 * - Message (14 sub-components)
 * - ModelSelector (14 sub-components)
 * - PromptInput (35 sub-components)
 * - Conversation (4 sub-components)
 * - And more...
 */

export { VitalStreamText, default as StreamText } from './VitalStreamText';
export { VitalSuggestionChips, default as SuggestionChips } from './VitalSuggestionChips';
export { VitalQuickActions, default as QuickActions } from './VitalQuickActions';
export { VitalVoiceInterface, default as VoiceInterface } from './VitalVoiceInterface';

// Suggestion component suite (ai-elements compatible)
export {
  VitalSuggestions,
  VitalSuggestion,
  // Aliases
  Suggestions,
  Suggestion,
} from './VitalSuggestion';

// PromptInput component suite (35 sub-components)
export {
  VitalPromptInput,
  VitalPromptInputProvider,
  VitalPromptInputHeader,
  VitalPromptInputBody,
  VitalPromptInputFooter,
  VitalPromptInputTools,
  VitalPromptInputTextarea,
  VitalPromptInputButton,
  VitalPromptInputSubmit,
  VitalPromptInputAttachment,
  VitalPromptInputAttachments,
  VitalPromptInputActionMenu,
  VitalPromptInputActionMenuTrigger,
  VitalPromptInputActionMenuContent,
  VitalPromptInputActionMenuItem,
  VitalPromptInputActionAddAttachments,
  VitalPromptInputSpeechButton,
  VitalPromptInputSelect,
  VitalPromptInputSelectTrigger,
  VitalPromptInputSelectValue,
  VitalPromptInputSelectContent,
  VitalPromptInputSelectItem,
  VitalPromptInputHoverCard,
  VitalPromptInputHoverCardTrigger,
  VitalPromptInputHoverCardContent,
  VitalPromptInputTabsList,
  VitalPromptInputTab,
  VitalPromptInputTabLabel,
  VitalPromptInputTabBody,
  VitalPromptInputTabItem,
  VitalPromptInputCommand,
  VitalPromptInputCommandInput,
  VitalPromptInputCommandList,
  VitalPromptInputCommandEmpty,
  VitalPromptInputCommandGroup,
  VitalPromptInputCommandItem,
  VitalPromptInputCommandSeparator,
  // Aliases
  PromptInput,
  PromptInputProvider,
  PromptInputHeader,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTools,
  PromptInputTextarea,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionAddAttachments,
  PromptInputSpeechButton,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputHoverCard,
  PromptInputHoverCardTrigger,
  PromptInputHoverCardContent,
  PromptInputTabsList,
  PromptInputTab,
  PromptInputTabLabel,
  PromptInputTabBody,
  PromptInputTabItem,
  PromptInputCommand,
  PromptInputCommandInput,
  PromptInputCommandList,
  PromptInputCommandEmpty,
  PromptInputCommandGroup,
  PromptInputCommandItem,
  PromptInputCommandSeparator,
  // Hooks
  usePromptInputController,
  useProviderAttachments,
  usePromptInputAttachments,
} from './VitalPromptInput';

// Model Selector component suite (14 sub-components)
export {
  VitalModelSelector,
  VitalModelSelectorTrigger,
  VitalModelSelectorContent,
  VitalModelSelectorDialog,
  VitalModelSelectorInput,
  VitalModelSelectorList,
  VitalModelSelectorEmpty,
  VitalModelSelectorGroup,
  VitalModelSelectorItem,
  VitalModelSelectorShortcut,
  VitalModelSelectorSeparator,
  VitalModelSelectorLogo,
  VitalModelSelectorLogoGroup,
  VitalModelSelectorName,
  // Aliases
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorDialog,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorShortcut,
  ModelSelectorSeparator,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
} from './VitalModelSelector';

// Message component suite (14 sub-components)
export {
  VitalMessage,
  VitalMessageContent,
  VitalMessageActions,
  VitalMessageAction,
  VitalMessageBranch,
  VitalMessageBranchContent,
  VitalMessageBranchSelector,
  VitalMessageBranchPrevious,
  VitalMessageBranchNext,
  VitalMessageBranchPage,
  VitalMessageResponse,
  VitalMessageAttachment,
  VitalMessageAttachments,
  VitalMessageToolbar,
  // Aliases
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageBranch,
  MessageBranchContent,
  MessageBranchSelector,
  MessageBranchPrevious,
  MessageBranchNext,
  MessageBranchPage,
  MessageResponse,
  MessageAttachment,
  MessageAttachments,
  MessageToolbar,
} from './VitalMessage';

// Conversation container
export {
  VitalConversation,
  VitalConversationContent,
  VitalConversationEmptyState,
  VitalConversationScrollButton,
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  // Hook
  useConversationContext,
} from './VitalConversation';

// AI Response wrapper (Streamdown integration for jitter-free streaming)
export { 
  VitalResponse, 
  VitalStreamdownResponse,
  Response,
  StreamdownResponse,
} from './VitalResponse';

// OpenIn component suite (22 sub-components)
// Supports both VITAL platform destinations and external AI platforms
export {
  // Core components
  VitalOpenIn,
  VitalOpenInTrigger,
  VitalOpenInContent,
  VitalOpenInItem,
  VitalOpenInLabel,
  VitalOpenInSeparator,
  // VITAL Platform destinations (Mode 1-4, Ask Expert, Ask Panel, Workflow)
  VitalOpenInMode1,
  VitalOpenInMode2,
  VitalOpenInMode3,
  VitalOpenInMode4,
  VitalOpenInAskExpert,
  VitalOpenInAskPanel,
  VitalOpenInWorkflow,
  VitalOpenInAgentBuilder,
  // External AI platforms
  VitalOpenInChatGPT,
  VitalOpenInClaude,
  VitalOpenInT3,
  VitalOpenInScira,
  VitalOpenInV0,
  VitalOpenInCursor,
  VitalOpenInPerplexity,
  // Aliases (ai-elements compatibility)
  OpenIn,
  OpenInTrigger,
  OpenInContent,
  OpenInItem,
  OpenInLabel,
  OpenInSeparator,
  OpenInChatGPT,
  OpenInClaude,
  OpenInT3,
  OpenInScira,
  OpenInv0,
  OpenInCursor,
  // Legacy aliases
  VitalOpenInChat,
  OpenInChat,
  // Hook
  useOpenInContext,
} from './VitalOpenInChat';

// Re-export types
export type {
  VoiceState,
  VoiceSettings,
  VitalVoiceInterfaceProps,
} from './VitalVoiceInterface';

export type {
  VitalResponseProps,
} from './VitalResponse';

export type {
  ConversationContextValue,
  ConversationInstance,
  VitalConversationProps,
  VitalConversationContentProps,
  VitalConversationEmptyStateProps,
  VitalConversationScrollButtonProps,
} from './VitalConversation';

export type {
  VitalResponseProps,
} from './VitalResponse';

export type {
  VitalOpenInProps,
  VitalOpenInTriggerProps,
  VitalOpenInContentProps,
  VitalOpenInItemProps,
  VitalOpenInLabelProps,
  VitalOpenInSeparatorProps,
} from './VitalOpenInChat';

export type {
  MessageRole,
  FileUIPart,
  VitalMessageProps,
  VitalMessageContentProps,
  VitalMessageActionsProps,
  VitalMessageActionProps,
  VitalMessageBranchProps,
  VitalMessageBranchContentProps,
  VitalMessageBranchSelectorProps,
  VitalMessageBranchPreviousProps,
  VitalMessageBranchNextProps,
  VitalMessageBranchPageProps,
  VitalMessageResponseProps,
  VitalMessageAttachmentProps,
  VitalMessageAttachmentsProps,
  VitalMessageToolbarProps,
} from './VitalMessage';

export type {
  AIProvider,
  ExecutionMode,
  VitalModelSelectorProps,
  VitalModelSelectorTriggerProps,
  VitalModelSelectorContentProps,
  VitalModelSelectorDialogProps,
  VitalModelSelectorInputProps,
  VitalModelSelectorListProps,
  VitalModelSelectorEmptyProps,
  VitalModelSelectorGroupProps,
  VitalModelSelectorItemProps,
  VitalModelSelectorShortcutProps,
  VitalModelSelectorSeparatorProps,
  VitalModelSelectorLogoProps,
  VitalModelSelectorLogoGroupProps,
  VitalModelSelectorNameProps,
} from './VitalModelSelector';

export type {
  FileUIPart as PromptInputFileUIPart,
  ChatStatus,
  AttachmentsContext,
  TextInputContext,
  PromptInputControllerProps,
  PromptInputMessage,
  VitalPromptInputProps,
  VitalPromptInputProviderProps,
  VitalPromptInputHeaderProps,
  VitalPromptInputBodyProps,
  VitalPromptInputFooterProps,
  VitalPromptInputToolsProps,
  VitalPromptInputTextareaProps,
  VitalPromptInputButtonProps,
  VitalPromptInputSubmitProps,
  VitalPromptInputAttachmentProps,
  VitalPromptInputAttachmentsProps,
  VitalPromptInputActionMenuProps,
  VitalPromptInputActionMenuTriggerProps,
  VitalPromptInputActionMenuContentProps,
  VitalPromptInputActionMenuItemProps,
  VitalPromptInputActionAddAttachmentsProps,
  VitalPromptInputSpeechButtonProps,
  VitalPromptInputSelectProps,
  VitalPromptInputSelectTriggerProps,
  VitalPromptInputSelectValueProps,
  VitalPromptInputSelectContentProps,
  VitalPromptInputSelectItemProps,
  VitalPromptInputHoverCardProps,
  VitalPromptInputHoverCardTriggerProps,
  VitalPromptInputHoverCardContentProps,
  VitalPromptInputTabsListProps,
  VitalPromptInputTabProps,
  VitalPromptInputTabLabelProps,
  VitalPromptInputTabBodyProps,
  VitalPromptInputTabItemProps,
  VitalPromptInputCommandProps,
  VitalPromptInputCommandInputProps,
  VitalPromptInputCommandListProps,
  VitalPromptInputCommandEmptyProps,
  VitalPromptInputCommandGroupProps,
  VitalPromptInputCommandItemProps,
  VitalPromptInputCommandSeparatorProps,
} from './VitalPromptInput';
