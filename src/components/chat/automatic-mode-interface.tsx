import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Users, 
  ChevronRight,
  Info,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrchestrationResult } from '@/features/chat/services/automatic-orchestrator';
// Define Agent interface locally to avoid import issues
interface Agent {
  id?: string;
  name: string;
  display_name?: string;
  description: string;
  system_prompt?: string;
  business_function?: string;
  tier?: number;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  capabilities?: string[];
  knowledge_domains?: string[];
  rag_enabled?: boolean;
}

interface AutomaticModeInterfaceProps {
  orchestrationResult?: OrchestrationResult;
  isProcessing: boolean;
  onConfirmAgent?: () => void;
  onSwitchToManual?: () => void;
  onSelectAlternative?: (agent: Agent) => void;
}

export function AutomaticModeInterface({
  orchestrationResult,
  isProcessing,
  onConfirmAgent,
  onSwitchToManual,
  onSelectAlternative
}: AutomaticModeInterfaceProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="space-y-4">
      {/* Processing State */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">
                  Analyzing Your Query...
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Finding the best expert to answer your question
                </p>
                <Progress value={33} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Orchestration Result */}
      {orchestrationResult && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Expert Selected Automatically
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default" className="bg-green-600">
                      {Math.round(orchestrationResult.confidence * 100)}% Match
                    </Badge>
                    <Badge variant="outline">
                      {orchestrationResult.strategy === 'single' ? 'Single Expert' :
                       orchestrationResult.strategy === 'multi' ? 'Multi-Expert Team' :
                       'Tiered Escalation'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Selected Agent */}
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {orchestrationResult.selectedAgent.display_name?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {orchestrationResult.selectedAgent.display_name || orchestrationResult.selectedAgent.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {orchestrationResult.selectedAgent.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">
                        Tier {orchestrationResult.selectedAgent.tier || 1}
                      </Badge>
                      <Badge variant="secondary">
                        {orchestrationResult.selectedAgent.business_function || 'General'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={onConfirmAgent}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Proceed
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
              
              {/* Reasoning */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3"
                  >
                    {/* Why This Expert */}
                    <div className="bg-white/50 rounded-lg p-3 border">
                      <h5 className="font-medium text-sm mb-2">Selection Reasoning</h5>
                      <ul className="space-y-1">
                        {orchestrationResult.reasoning.map((reason, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Query Analysis */}
                    <div className="bg-white/50 rounded-lg p-3 border">
                      <h5 className="font-medium text-sm mb-2">Query Analysis</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Domain:</span>
                          <Badge variant="outline" className="ml-2">
                            {orchestrationResult.analysis.domain.primary}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Complexity:</span>
                          <Badge variant="outline" className="ml-2">
                            {orchestrationResult.analysis.complexity.score}/10
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Intent:</span>
                          <Badge variant="outline" className="ml-2">
                            {orchestrationResult.analysis.intent.primary}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Urgency:</span>
                          <Badge variant="outline" className="ml-2">
                            {orchestrationResult.analysis.urgency}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Alternative Agents */}
              {orchestrationResult.alternativeAgents.length > 0 && (
                <div className="border-t pt-4">
                  <h5 className="text-sm font-medium mb-2">Alternative Experts</h5>
                  <div className="space-y-2">
                    {orchestrationResult.alternativeAgents.slice(0, 2).map(agent => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-2 bg-white/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                            {agent.display_name?.charAt(0) || agent.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{agent.display_name || agent.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {agent.business_function || 'General'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectAlternative?.(agent)}
                        >
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Switch to Manual */}
              <div className="flex justify-center pt-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={onSwitchToManual}
                  className="text-muted-foreground"
                >
                  Prefer to choose manually?
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
