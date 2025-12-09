/**
 * UI Component Re-exports
 * 
 * These are base shadcn/ui components that the VITAL AI UI components depend on.
 * They are re-exported from @vital/ui for consistency.
 * 
 * In a monorepo setup, you would install @vital/ui and these would be proper imports.
 * For now, consumers should ensure they have shadcn/ui components installed.
 */

// NOTE: These exports assume the consumer has shadcn/ui components installed
// In apps/vital-system, these would come from @/components/ui/*

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

export {
  Alert,
  AlertDescription,
  AlertTitle,
} from './alert';

export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Badge } from './badge';
export { Button } from './button';

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible';

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command';

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

export { Input } from './input';
export { Label } from './label';

export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

export { Progress } from './progress';
export { ScrollArea, ScrollBar } from './scroll-area';
export { Separator } from './separator';

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

export { Textarea } from './textarea';

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
