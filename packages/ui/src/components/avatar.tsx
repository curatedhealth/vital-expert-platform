"use client"

import * as React from "react"

import { cn } from "../lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, onLoad, onError, ...props }, ref) => {
    const [imageStatus, setImageStatus] = React.useState<"loading" | "loaded" | "error">("loading")

    React.useEffect(() => {
      if (!src) {
        setImageStatus("error")
        return
      }

      setImageStatus("loading")

      const img = new Image()
      img.src = typeof src === 'string' ? src : URL.createObjectURL(src)

      img.onload = (e) => {
        setImageStatus("loaded")
        onLoad?.(e as any)
      }

      img.onerror = (e) => {
        setImageStatus("error")
        onError?.(e as any)
      }
    }, [src, onLoad, onError])

    if (imageStatus !== "loaded") {
      return null
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt || "Avatar"}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  delayMs?: number
}

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, delayMs, children, ...props }, ref) => {
    const [canRender, setCanRender] = React.useState(delayMs === undefined)

    React.useEffect(() => {
      if (delayMs !== undefined) {
        const timeout = setTimeout(() => {
          setCanRender(true)
        }, delayMs)

        return () => clearTimeout(timeout)
      }
    }, [delayMs])

    if (!canRender) {
      return null
    }

    return (
      <span
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-muted",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
