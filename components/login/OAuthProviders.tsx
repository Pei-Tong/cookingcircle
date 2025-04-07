import { FaGithub, FaGoogle, FaDiscord } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type OAuthProviderProps = {
  redirectTo?: string
}

export function OAuthProviders({ redirectTo = '/' }: OAuthProviderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'discord') => {
    try {
      setLoading(provider)
      setError(null)
      
      console.log(`Initiating ${provider} OAuth login with redirectTo:`, redirectTo)
      
      // For local development, use consistent origin to avoid port changes
      const origin = window.location.origin.includes('localhost') 
        ? 'http://localhost:3000' 
        : window.location.origin
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
        }
      })

      if (error) throw error
      
      if (data?.url) {
        console.log(`Redirecting to ${provider} OAuth URL:`, data.url)
        window.location.href = data.url
      } else {
        throw new Error(`Could not get ${provider} login URL`)
      }
    } catch (err: any) {
      console.error(`${provider} OAuth error:`, err)
      setError(err.message || `Error signing in with ${provider}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col space-y-3 mt-4">
      <p className="text-center text-sm">Or sign in with</p>
      {error && <p className="text-center text-xs text-red-500">{error}</p>}
      
      <button
        onClick={() => handleOAuthLogin('google')}
        disabled={!!loading}
        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 p-2.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-70"
      >
        <FaGoogle className="h-5 w-5 text-red-500" />
        <span>{loading === 'google' ? 'Loading...' : 'Google'}</span>
      </button>
      
      <button
        onClick={() => handleOAuthLogin('github')}
        disabled={!!loading}
        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 p-2.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-70"
      >
        <FaGithub className="h-5 w-5 text-gray-800" />
        <span>{loading === 'github' ? 'Loading...' : 'GitHub'}</span>
      </button>
      
      <button
        onClick={() => handleOAuthLogin('discord')}
        disabled={!!loading}
        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 p-2.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-70"
      >
        <FaDiscord className="h-5 w-5 text-indigo-500" />
        <span>{loading === 'discord' ? 'Loading...' : 'Discord'}</span>
      </button>
    </div>
  )
} 