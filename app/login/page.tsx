"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Add your authentication logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated delay
      router.push("/")
    } catch (error) {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Hero Image */}
          <div className="hidden lg:block relative h-[600px] rounded-xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
              }}
            />
            <div className="relative z-20 flex flex-col h-full p-8">
              <div className="flex items-center text-lg font-medium text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-6 w-6"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
                Cooking Circle
              </div>
              <div className="mt-auto">
                <blockquote className="space-y-2">
                  <p className="text-lg text-white">
                    &ldquo;Join our community of food enthusiasts and discover amazing recipes from around the
                    world.&rdquo;
                  </p>
                </blockquote>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex justify-start lg:justify-center px-4 lg:px-0">
            <div className="w-full max-w-[350px]">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <form onSubmit={onSubmit}>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                              Forgot password?
                            </Link>
                          </div>
                          <Input
                            id="password"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="current-password"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember" />
                          <label
                            htmlFor="remember"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Remember me
                          </label>
                        </div>
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && (
                            <svg
                              className="mr-2 h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          )}
                          Sign In
                        </Button>
                      </div>
                    </form>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="outline" disabled={isLoading} className="w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Google
                      </Button>
                      <Button variant="outline" disabled={isLoading} className="w-full" social="facebook">
                        Facebook
                      </Button>
                      <Button variant="outline" disabled={isLoading} className="w-full" social="instagram">
                        Instagram
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="px-8 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
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

