"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  onValueChange?: (value: number[]) => void
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const progressRef = React.useRef<HTMLDivElement>(null)

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true)
      updateProgress(e)
    }

    const handleMouseMove = React.useCallback(
      (e: MouseEvent) => {
        if (isDragging) {
          updateProgress(e)
        }
      },
      [isDragging],
    )

    const handleMouseUp = React.useCallback(() => {
      setIsDragging(false)
    }, [])

    const updateProgress = (e: MouseEvent | React.MouseEvent) => {
      if (progressRef.current && onValueChange) {
        const rect = progressRef.current.getBoundingClientRect()
        const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
        onValueChange([percentage])
      }
    }

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
        return () => {
          document.removeEventListener("mousemove", handleMouseMove)
          document.removeEventListener("mouseup", handleMouseUp)
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary cursor-pointer", className)}
        {...props}
        onMouseDown={handleMouseDown}
      >
        <div ref={progressRef} className="absolute inset-0">
          <ProgressPrimitive.Indicator
            className="h-full w-full flex-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
          {/* Scrubber handle */}
          <div
            className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 transition-all hover:scale-110"
            style={{ left: `${value || 0}%`, transform: "translateX(-50%) translateY(-50%)" }}
          />
        </div>
      </ProgressPrimitive.Root>
    )
  },
)
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
