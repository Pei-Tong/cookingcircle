"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Mail, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get("redirectTo") || "/"
  
  console.log("[LoginPage] Initial render with redirectTo:", redirectTo)

  // 檢查用戶是否已登入
  useEffect(() => {
    console.log("[LoginPage] useEffect running, checking user session")
    async function checkUser() {
      const { data } = await supabase.auth.getSession()
      console.log("[LoginPage] Auth session check result:", data.session ? "Logged in" : "Not logged in")
      if (data.session) {
        const decodedRedirectTo = decodeURIComponent(redirectTo)
        console.log("[LoginPage] User already logged in, redirecting to:", decodedRedirectTo)
        router.push(decodedRedirectTo)
      }
    }
    checkUser()
  }, [redirectTo, router])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const email = (event.currentTarget as any).email.value
    const password = (event.currentTarget as any).password.value
    
    console.log("[LoginPage] Attempting login for user:", email)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[LoginPage] Login error:", error.message)
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      if (data.session) {
        const decodedRedirectTo = decodeURIComponent(redirectTo)
        console.log("[LoginPage] Login successful, redirecting to:", decodedRedirectTo)
        
        // 直接使用 window.location 進行重定向，避免 Next.js router 的潛在問題
        window.location.href = decodedRedirectTo
      }
    } catch (err) {
      console.error("[LoginPage] Login exception:", err)
      setError("An error occurred during login. Please try again.")
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: "google" | "github" | "discord") => {
    try {
      setIsLoading(true)
      
      const origin = window.location.origin
      console.log("[LoginPage] OAuth login with provider:", provider, "redirectTo:", redirectTo)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
        }
      })

      if (error) throw error
      
      if (data?.url) {
        console.log(`[LoginPage] Redirecting to ${provider} OAuth URL:`, data.url)
        window.location.href = data.url
      } else {
        throw new Error(`Could not get ${provider} login URL`)
      }
    } catch (err: any) {
      console.error(`[LoginPage] ${provider} OAuth error:`, err)
      setError(`Error signing in with ${provider}`)
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Image */}
          <div className="hidden lg:block relative h-[600px] rounded-xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
              }}
            />
            <div className="relative z-20 flex flex-col h-full p-8">
              <div className="text-lg font-medium text-white flex items-center">
                🍳 Cooking Circle
              </div>
              <div className="mt-auto text-white text-lg">
                <p>
                  "Join our community of food lovers and discover amazing recipes from around the world."
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="flex justify-start lg:justify-center px-4 lg:px-0">
            <div className="w-full max-w-[350px]">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" required disabled={isLoading} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required disabled={isLoading} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                      />
                      <Label htmlFor="remember" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  {/* OAuth section */}
                  <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleOAuthLogin("google")}
                      disabled={isLoading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleOAuthLogin("github")}
                      disabled={isLoading}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleOAuthLogin("discord")}
                      disabled={isLoading}
                    >
                      Discord
                    </Button>
                  </div>
                </CardContent>

                <CardFooter>
                  <p className="text-sm text-muted-foreground text-center w-full">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline hover:text-primary">
                      Sign up
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
