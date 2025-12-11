/**
 * ToolCallList - render tool_call SSE events for transparency.
 */

'use client'

import { Wrench, CheckCircle2, XCircle } from 'lucide-react'

export interface ToolCall {
  id: string
  tool_id?: string
  tool_name?: string
  tool_type?: string
  status?: string
  input?: Record<string, unknown>
  output?: unknown
  duration_ms?: number
  error?: string
}

export function ToolCallList({ toolCalls }: { toolCalls: ToolCall[] }) {
  if (!toolCalls.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Wrench className="h-4 w-4" />
        Tool Activity
      </div>
      <div className="space-y-2">
        {toolCalls.map((call) => {
          const isError = call.status === 'error'
          const isSuccess = call.status === 'success' || call.status === 'complete'
          return (
            <div
              key={call.id}
              className="border rounded-lg p-3 bg-white shadow-sm flex items-start gap-3 text-sm"
            >
              <div className="mt-0.5">
                {isSuccess ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : isError ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Wrench className="h-4 w-4 text-blue-500 animate-spin-slow" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{call.tool_name || call.tool_id || call.id}</span>
                  {call.tool_type && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {call.tool_type}
                    </span>
                  )}
                  {call.duration_ms !== undefined && (
                    <span className="text-xs text-gray-500">{call.duration_ms} ms</span>
                  )}
                </div>
                {call.error ? (
                  <div className="text-xs text-red-600 mt-1">{call.error}</div>
                ) : (
                  <div className="text-xs text-gray-600 mt-1 truncate">
                    {String(call.output || '')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ToolCallList
