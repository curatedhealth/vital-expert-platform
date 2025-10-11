// Auto-generated UI component type declarations
declare module '@/components/ui/badge' {
  export const Badge: any;
}
declare module '@/components/ui/button' {
  export const Button: any;
}
declare module '@/components/ui/card' {
  export const Card: any;
  export const CardHeader: any;
  export const CardContent: any;
  export const CardDescription: any;
  export const CardTitle: any;
}
declare module '@/components/ui/dialog' {
  export const Dialog: any;
  export const DialogContent: any;
  export const DialogDescription: any;
  export const DialogFooter: any;
  export const DialogHeader: any;
  export const DialogTitle: any;
  export const DialogTrigger: any;
}
declare module '@/components/ui/input' {
  export const Input: any;
}
declare module '@/components/ui/label' {
  export const Label: any;
}
declare module '@/components/ui/select' {
  export const Select: any;
  export const SelectContent: any;
  export const SelectItem: any;
  export const SelectTrigger: any;
  export const SelectValue: any;
}
declare module '@/components/ui/tabs' {
  export const Tabs: any;
  export const TabsContent: any;
  export const TabsList: any;
  export const TabsTrigger: any;
}
declare module '@/components/ui/textarea' {
  export const Textarea: any;
}
declare module '@/lib/services/model-selector' {
  export interface KnowledgeDomain {
    id: string;
    code: string;
    name: string;
    slug: string;
    tier: number;
    priority: number;
    recommended_models: any;
    keywords: string[];
    sub_domains: string[];
    agent_count_estimate?: number;
    description?: string;
    color?: string;
  }
  export interface DomainModelConfig {
    embedding?: {
      primary?: string;
      fallback?: string;
    };
    chat?: {
      primary?: string;
      fallback?: string;
    };
  }
  export const modelSelector: any;
}
