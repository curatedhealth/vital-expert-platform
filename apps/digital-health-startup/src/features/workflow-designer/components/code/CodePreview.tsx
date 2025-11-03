/**
 * Code Preview Component
 * 
 * Displays generated code with syntax highlighting and export options
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Copy,
  Check,
  Code2,
  FileCode,
  Container,
  FileJson,
  BookOpen,
} from 'lucide-react';
import { langGraphCodeGenerator } from '../../generators/langgraph/LangGraphCodeGenerator';
import type { WorkflowDefinition } from '../../types/workflow';
import type { GeneratedCode } from '../../generators/langgraph/LangGraphCodeGenerator';

interface CodePreviewProps {
  workflow: WorkflowDefinition;
  onClose?: () => void;
}

export function CodePreview({ workflow, onClose }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'python' | 'docker' | 'jupyter' | 'api'>('python');
  
  // Generate code for all formats
  const pythonResult = langGraphCodeGenerator.generate(workflow);
  const dockerFile = generateDockerfile(pythonResult);
  const jupyterNotebook = generateJupyterNotebook(pythonResult);
  const apiTemplate = generateAPITemplate(pythonResult);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'python':
        return pythonResult.code;
      case 'docker':
        return dockerFile;
      case 'jupyter':
        return jupyterNotebook;
      case 'api':
        return apiTemplate;
      default:
        return pythonResult.code;
    }
  };

  const getActiveFilename = () => {
    const safeName = workflow.name.toLowerCase().replace(/\s+/g, '-');
    switch (activeTab) {
      case 'python':
        return `${safeName}.py`;
      case 'docker':
        return 'Dockerfile';
      case 'jupyter':
        return `${safeName}.ipynb`;
      case 'api':
        return `${safeName}_api.py`;
      default:
        return `${safeName}.py`;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-600" />
            <div>
              <CardTitle className="text-base">Generated Code</CardTitle>
              <p className="text-xs text-gray-600 mt-1">
                {workflow.framework.toUpperCase()} - {workflow.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(getActiveContent())}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(getActiveContent(), getActiveFilename())}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Dependencies Badge */}
        {pythonResult.dependencies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-600">Dependencies:</span>
            {pythonResult.dependencies.map((dep) => (
              <Badge key={dep} variant="secondary" className="text-xs">
                {dep}
              </Badge>
            ))}
          </div>
        )}

        {/* Errors/Warnings */}
        {pythonResult.errors.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-800 mb-1">Errors:</p>
            {pythonResult.errors.map((err, i) => (
              <p key={i} className="text-xs text-red-700">• {err}</p>
            ))}
          </div>
        )}
        {pythonResult.warnings.length > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs font-semibold text-yellow-800 mb-1">Warnings:</p>
            {pythonResult.warnings.map((warn, i) => (
              <p key={i} className="text-xs text-yellow-700">• {warn}</p>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col">
          <div className="px-6 border-b">
            <TabsList className="h-auto">
              <TabsTrigger value="python" className="gap-2">
                <FileCode className="w-4 h-4" />
                Python Script
              </TabsTrigger>
              <TabsTrigger value="docker" className="gap-2">
                <Container className="w-4 h-4" />
                Docker
              </TabsTrigger>
              <TabsTrigger value="jupyter" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Jupyter
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2">
                <FileJson className="w-4 h-4" />
                API
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="python" className="h-full m-0">
              <CodeBlock code={pythonResult.code} language="python" />
            </TabsContent>
            <TabsContent value="docker" className="h-full m-0">
              <CodeBlock code={dockerFile} language="dockerfile" />
            </TabsContent>
            <TabsContent value="jupyter" className="h-full m-0">
              <CodeBlock code={jupyterNotebook} language="json" />
            </TabsContent>
            <TabsContent value="api" className="h-full m-0">
              <CodeBlock code={apiTemplate} language="python" />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Simple code block component (will be replaced with Monaco Editor later)
function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="h-full overflow-auto bg-gray-950 text-gray-100 p-4">
      <pre className="text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Generate Dockerfile
function generateDockerfile(result: GeneratedCode): string {
  const deps = result.dependencies.map(d => d.split('>=')[0]).join(' ');
  
  return `# Auto-generated Dockerfile for LangGraph Workflow
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy workflow code
COPY workflow.py .

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the workflow
CMD ["python", "workflow.py"]
`;
}

// Generate Jupyter Notebook
function generateJupyterNotebook(result: GeneratedCode): string {
  const notebook = {
    cells: [
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '# Auto-generated LangGraph Workflow\n',
          '\n',
          'This notebook contains the generated workflow code.\n',
        ],
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          '# Install dependencies\n',
          ...result.dependencies.map(d => `# !pip install ${d}\n`),
        ],
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: result.code.split('\n').map(line => line + '\n'),
      },
    ],
    metadata: {
      kernelspec: {
        display_name: 'Python 3',
        language: 'python',
        name: 'python3',
      },
      language_info: {
        name: 'python',
        version: '3.11.0',
      },
    },
    nbformat: 4,
    nbformat_minor: 4,
  };

  return JSON.stringify(notebook, null, 2);
}

// Generate FastAPI template
function generateAPITemplate(result: GeneratedCode): string {
  return `# Auto-generated FastAPI Template for LangGraph Workflow
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import uvicorn

# Import the generated workflow
${result.code}

# FastAPI app
app = FastAPI(title="LangGraph Workflow API")

# Request/Response models
class WorkflowRequest(BaseModel):
    message: str
    config: Dict[str, Any] = {}

class WorkflowResponse(BaseModel):
    result: Dict[str, Any]
    status: str

@app.post("/execute", response_model=WorkflowResponse)
async def execute_workflow(request: WorkflowRequest):
    """Execute the LangGraph workflow"""
    try:
        # Build the workflow
        app_instance = build_workflow()
        
        # Prepare config
        config = {
            "configurable": {
                "thread_id": request.config.get("thread_id", "default")
            }
        }
        
        # Execute
        result = app_instance.invoke(
            {"messages": [HumanMessage(content=request.message)]},
            config
        )
        
        return WorkflowResponse(
            result=result,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
}

