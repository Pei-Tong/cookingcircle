"use client"

import { useState, useRef, ChangeEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User } from "@/lib/db/types"

import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

import { Upload, X, Check } from "lucide-react"

export default function EditProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [profileImage, setProfileImage] = useState("/placeholder.svg")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  
  // Get current user data when component mounts
  useEffect(() => {
    async function getCurrentUser() {
      try {
        if (!supabase) {
          console.error("Supabase client is not initialized")
          return
        }
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUserId(session.user.id)
          
          // Fetch user profile data
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
            
          if (userError) {
            console.error("Error fetching user data:", userError)
            return
          }
          
          if (userData) {
            const user = userData as unknown as User
            
            // Populate form fields with user data
            setFirstName(String(userData.first_name || ""))
            setLastName(String(userData.last_name || ""))
            setUsername(String(userData.username || ""))
            setEmail(String(userData.email || ""))
            setBio(String(userData.bio || ""))
            
            // Set profile image if available
            if (userData.avatar_url || userData.profile_image) {
              setProfileImage(String(userData.avatar_url || userData.profile_image || "/placeholder.svg"))
            }
          }
        } else {
          // No authenticated user, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error("Error getting current user:", error)
      }
    }
    
    getCurrentUser()
  }, [router])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setProfileImage(URL.createObjectURL(file))
    }
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      if (!userId) {
        throw new Error("No user ID found. Please log in again.")
      }
      
      if (!supabase) {
        throw new Error("Supabase client is not initialized")
      }
      
      // Update user profile data in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          username: username,
          bio: bio,
          // Don't update email here as it requires additional authentication
        })
        .eq('user_id', userId)
        
      if (updateError) {
        console.error("Error updating profile:", updateError)
        throw new Error("Failed to update profile information.")
      }

      if (selectedFile) {
        // 1. Upload the image with overwrite
        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(`${userId}.png`, selectedFile, {
            cacheControl: "3600",
            upsert: true,
            contentType: selectedFile.type,
          })

        if (uploadError) {
          console.error("Upload error:", uploadError.message)
          throw new Error("Failed to upload profile image.")
        }

        // 2. Log current files in the bucket (debugging)
        const { data: files, error: listError } = await supabase.storage
          .from("profile-images")
          .list("", { limit: 100 })

        if (listError) {
          console.warn("List error:", listError.message)
        } else {
          console.log("Files in profile-images:", files)
        }

        // 3. Get the public URL and add a cache-busting timestamp
        const { data: publicUrlData } = supabase
          .storage
          .from("profile-images")
          .getPublicUrl(`${userId}.png`)

        if (publicUrlData?.publicUrl) {
          const freshUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`
          console.log("Updated avatar URL:", freshUrl)
          
          // Also update the avatar_url in the database
          const { error: avatarUpdateError } = await supabase
            .from('users')
            .update({
              avatar_url: freshUrl
            })
            .eq('user_id', userId)
            
          if (avatarUpdateError) {
            console.error("Error updating avatar URL:", avatarUpdateError)
          } else {
            setProfileImage(freshUrl)
          }
        }
      }

      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Redirect to the profile page with the username (preferred) or user ID
      if (username) {
        router.push(`/profile/${username}`)
      } else {
        router.push(`/profile/${userId}`)
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Something went wrong while saving.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Upload a profile picture to personalize your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback>CM</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null)
                          setProfileImage("/placeholder.svg")
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recommended: Square image, at least 400×400 pixels
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
              </CardContent>
            </Card>

            {successMessage && (
              <Alert className="bg-green-50 text-green-600 border-green-200">
                <Check className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="outline">Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
