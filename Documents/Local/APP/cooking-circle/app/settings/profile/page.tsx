"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Facebook, Instagram, Twitter, Globe, Check } from "lucide-react"

export default function EditProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

  const specialties = [
    "Italian Cuisine",
    "Asian Fusion",
    "Baking",
    "Vegetarian",
    "Vegan",
    "Desserts",
    "Healthy Cooking",
    "Quick Meals",
    "Meal Prep",
    "Gluten-Free",
  ]

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties((current) =>
      current.includes(specialty) ? current.filter((s) => s !== specialty) : [...current, specialty],
    )
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSuccessMessage("Profile updated successfully!")
    setIsLoading(false)
    // Reset success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Picture */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Upload a profile picture to personalize your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>CM</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload New
                          </Button>
                          <Button variant="outline" size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Recommended: Square image, at least 400x400 pixels
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="@johndoe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" placeholder="Tell us about yourself..." className="min-h-[100px]" />
                    </div>
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>Connect your social media accounts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Website
                      </Label>
                      <Input id="website" type="url" placeholder="https://your-website.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">
                        <Instagram className="w-4 h-4 inline mr-2" />
                        Instagram
                      </Label>
                      <Input id="instagram" placeholder="@username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">
                        <Facebook className="w-4 h-4 inline mr-2" />
                        Facebook
                      </Label>
                      <Input id="facebook" placeholder="username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">
                        <Twitter className="w-4 h-4 inline mr-2" />X
                      </Label>
                      <Input id="twitter" placeholder="@username" />
                    </div>
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
            </TabsContent>

            <TabsContent value="preferences">
              <div className="space-y-6">
                {/* Cooking Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cooking Preferences</CardTitle>
                    <CardDescription>Customize your cooking experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Measurement System</Label>
                      <Select defaultValue="metric">
                        <SelectTrigger>
                          <SelectValue placeholder="Select measurement system" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (g, ml)</SelectItem>
                          <SelectItem value="imperial">Imperial (oz, cups)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Cooking Level</Label>
                      <Select defaultValue="intermediate">
                        <SelectTrigger>
                          <SelectValue placeholder="Select your cooking level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="professional">Professional Chef</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Dietary Restrictions</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dietary restrictions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                          <SelectItem value="dairy-free">Dairy-Free</SelectItem>
                          <SelectItem value="keto">Keto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Specialties</Label>
                      <div className="flex flex-wrap gap-2">
                        {specialties.map((specialty) => (
                          <Badge
                            key={specialty}
                            variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleSpecialtyToggle(specialty)}
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage your email notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New Recipe Comments</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when someone comments on your recipes
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New Followers</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications when someone follows you</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Recipe Likes</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when someone likes your recipes
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Newsletter</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive our weekly newsletter with cooking tips and trends
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                {/* Change Password */}
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" placeholder="Enter current password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" placeholder="Enter new password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                    </div>
                    <Button className="w-full">Update Password</Button>
                  </CardContent>
                </Card>

                {/* Two-Factor Authentication */}
                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Secure your account with 2FA</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                {/* Account Deletion */}
                <Card>
                  <CardHeader>
                    <CardTitle>Delete Account</CardTitle>
                    <CardDescription>Permanently delete your account and all your data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive">Delete Account</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}

