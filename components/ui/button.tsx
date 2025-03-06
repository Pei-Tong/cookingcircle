"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Bookmark, LogIn, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-9 w-9",
        auto: "h-auto min-h-[32px] px-3 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  showCollectIcon?: boolean
  href?: string
  showLogin?: boolean
  social?: "facebook" | "instagram"
  showEditProfile?: boolean
  showCommentDialog?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      showCollectIcon = false,
      children,
      href,
      showEditProfile,
      showCommentDialog,
      ...props
    },
    ref,
  ) => {
    const router = useRouter()
    const [commentDialogOpen, setCommentDialogOpen] = useState(false)

    const handleClick = (e: React.MouseEvent) => {
      if (props.onClick) {
        props.onClick(e)
      }
      if (props.showLogin) {
        router.push("/login")
      }
      if (props.showEditProfile) {
        router.push("/settings/profile")
      }
      if (props.showCommentDialog) {
        setCommentDialogOpen(true)
      }
    }

    const Comp = asChild ? Slot : href ? Link : "button"

    const commonProps = {
      className: cn(buttonVariants({ variant, size, className })),
      onClick: handleClick,
      ...props,
    }

    // If it's a login button without an href, add the login page href
    if (props.showLogin && !href) {
      href = "/login"
    }
    // If it's an edit profile button without an href, add the edit profile page href
    if (props.showEditProfile && !href) {
      href = "/settings/profile"
    }

    return (
      <>
        {props.showCommentDialog && commentDialogOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setCommentDialogOpen(false)}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Add a Comment</h3>
              <textarea
                className="w-full border rounded-md p-2 min-h-[100px] mb-4"
                placeholder="Share your thoughts on this recipe..."
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  onClick={() => setCommentDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  onClick={() => {
                    // Handle comment submission here
                    setCommentDialogOpen(false)
                  }}
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        )}

        {href ? (
          <Comp href={href} {...commonProps}>
            {showCollectIcon && <Bookmark className="mr-2 h-4 w-4" />}
            {props.showLogin && <LogIn className="mr-2 h-4 w-4" />}
            {props.showEditProfile && <Edit className="mr-2 h-4 w-4" />}
            {children}
          </Comp>
        ) : (
          <Comp ref={ref} {...commonProps}>
            {showCollectIcon && <Bookmark className="mr-2 h-4 w-4" />}
            {props.showEditProfile && <Edit className="mr-2 h-4 w-4" />}
            {props.social === "facebook" && (
              <>
                <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="#1877F2">
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                </svg>
                {children}
              </>
            )}
            {props.social === "instagram" && (
              <>
                <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="url(#instagram-gradient)">
                  <defs>
                    <radialGradient id="instagram-gradient" r="150%" cx="30%" cy="107%">
                      <stop stopColor="#fdf497" offset="0" />
                      <stop stopColor="#fdf497" offset="0.05" />
                      <stop stopColor="#fd5949" offset="0.45" />
                      <stop stopColor="#d6249f" offset="0.6" />
                      <stop stopColor="#285AEB" offset="0.9" />
                    </radialGradient>
                  </defs>
                  <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2m0 2c-4.415 0-8 3.585-8 8s3.585 8 8 8 8-3.585 8-8-3.585-8-8-8m0 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2" />
                </svg>
                {children}
              </>
            )}
            {!props.social && !props.showLogin && children}
          </Comp>
        )}
      </>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

