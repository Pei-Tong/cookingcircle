"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [emailChecked, setEmailChecked] = useState(false)
  const [usernameChecked, setUsernameChecked] = useState(false)

  const [emailInput, setEmailInput] = useState("")
  const [usernameInput, setUsernameInput] = useState("")

  const router = useRouter()

  // check Duplicate email
  const checkEmailDuplicate = async () => {
    const { data } = await supabase
      .from("users")
      .select("email")
      .eq("email", emailInput)
      .maybeSingle()

    if (data) {
      setEmailError("Email is already in use")
      setEmailChecked(false)
    } else {
      setEmailError("")
      setEmailChecked(true)
    }
  }

  // check Duplicate username
  const checkUsernameDuplicate = async () => {
    const { data } = await supabase
      .from("users")
      .select("username")
      .eq("username", usernameInput)
      .maybeSingle()

    if (data) {
      setUsernameError("Username is already taken")
      setUsernameChecked(false)
    } else {
      setUsernameError("")
      setUsernameChecked(true)
    }
  }

  // submit the sign up
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!emailChecked || !usernameChecked) {
      setError("Please check email and username availability")
      setIsLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    // insert user info
    const { error: insertError } = await supabase.from("users").insert([
      {
        user_id: data.user?.id,
        email,
        username,
      },
    ])

    if (insertError) {
      setError("Failed to create user profile")
      setIsLoading(false)
      return
    }

    router.push("/login")
    setIsLoading(false)
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6 flex justify-center">
        <div className="w-full max-w-[400px]">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Enter your info to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-4">
                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      disabled={isLoading}
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value)
                        setEmailChecked(false)
                        setEmailError("")
                      }}
                    />
                    <Button type="button" variant="outline" onClick={checkEmailDuplicate} disabled={!emailInput}>
                      Check
                    </Button>
                  </div>
                  {emailInput && emailChecked && (
                    <p className="text-sm text-green-600">Email is available</p>
                  )}
                  {emailInput && !emailChecked && emailError && (
                    <p className="text-sm text-red-500"> {emailError}</p>
                  )}
                </div>

                {/* Username */}
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      name="username"
                      required
                      disabled={isLoading}
                      value={usernameInput}
                      onChange={(e) => {
                        setUsernameInput(e.target.value)
                        setUsernameChecked(false)
                        setUsernameError("")
                      }}
                    />
                    <Button type="button" variant="outline" onClick={checkUsernameDuplicate} disabled={!usernameInput}>
                      Check
                    </Button>
                  </div>
                  {usernameInput && usernameChecked && (
                    <p className="text-sm text-green-600"> Username is available</p>
                  )}
                  {usernameInput && !usernameChecked && usernameError && (
                    <p className="text-sm text-red-500"> {usernameError}</p>
                  )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required disabled={isLoading} />
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" required disabled={isLoading} />
                </div>

                {/* General Error */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit */}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Signing up..." : "Sign Up"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
