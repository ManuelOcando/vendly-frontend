"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { api } from "@/lib/api"

export default function DebugPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function testAuth() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setResult({ error: "No session found" })
        return
      }

      // Test debug endpoint
      const debugResult = await api("/api/v1/debug-auth", {
        token: session.access_token
      })
      
      setResult(debugResult)
    } catch (e: any) {
      setResult({ error: e.message, status: e.status })
    } finally {
      setLoading(false)
    }
  }

  async function testItems() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setResult({ error: "No session found" })
        return
      }

      // Test items endpoint
      const items = await api("/api/v1/items", {
        token: session.access_token
      })
      
      setResult({ success: "Items endpoint works", items })
    } catch (e: any) {
      setResult({ error: e.message, status: e.status })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={testAuth}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Authentication
        </button>
        
        <button 
          onClick={testItems}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded ml-2 disabled:opacity-50"
        >
          Test Items Endpoint
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
