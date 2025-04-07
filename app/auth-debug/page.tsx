"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

export default function AuthDebugPage() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkSession() {
      try {
        setLoading(true)
        setError(null)
        
        console.log("Checking session...")
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        console.log("Session data:", data)
        setSession(data.session)
        
        if (data.session) {
          const { data: userData, error: userError } = await supabase.auth.getUser()
          if (userError) throw userError
          setUser(userData.user)
        }
      } catch (err: any) {
        console.error("Error checking session:", err)
        setError(err.message || "An error occurred while checking the session")
      } finally {
        setLoading(false)
      }
    }
    
    checkSession()
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "new session" : "no session")
        setSession(newSession)
        
        if (newSession) {
          const { data: userData } = await supabase.auth.getUser()
          setUser(userData?.user || null)
        } else {
          setUser(null)
        }
      }
    )
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])
  
  const handleSignOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setSession(null)
      setUser(null)
    } catch (err: any) {
      setError(err.message || "Error signing out")
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading authentication status...</p>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Session Status</h2>
        <div className="grid grid-cols-2 gap-2">
          <p className="font-medium">Logged in:</p>
          <p>{session ? "Yes" : "No"}</p>
          
          {session && (
            <>
              <p className="font-medium">Session expires:</p>
              <p>{new Date(session.expires_at * 1000).toLocaleString()}</p>
              
              <p className="font-medium">User ID:</p>
              <p>{session.user?.id}</p>
              
              <p className="font-medium">Email:</p>
              <p>{session.user?.email}</p>
            </>
          )}
        </div>
        
        {session ? (
          <button
            onClick={handleSignOut}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        ) : (
          <div className="mt-4 space-y-2">
            <Link 
              href="/login" 
              className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go to Login Page
            </Link>
            <Link 
              href="/signup" 
              className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Go to Signup Page
            </Link>
          </div>
        )}
      </div>
      
      {user && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Details</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 flex space-x-4">
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Home
        </Link>
        <Link href="/admin" className="text-blue-600 hover:underline">
          Go to Admin
        </Link>
      </div>
    </div>
  )
} 