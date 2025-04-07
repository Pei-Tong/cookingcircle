"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const email = (event.currentTarget as any).email.value
    const password = (event.currentTarget as any).password.value

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Invalid email or password")
    } else {
      router.push("/")
    }

    setIsLoading(false)
  }

  const handleOAuthLogin = async (provider: "google" | "github" | "discord") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) console.error(`${provider} login error:`, error.message)
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
                  “Join our community of food lovers and discover amazing recipes from around the world.”
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
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleOAuthLogin("github")}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleOAuthLogin("discord")}
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
