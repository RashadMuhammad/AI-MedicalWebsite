"use client"

import { toast as hotToast, ToastOptions } from "react-hot-toast"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
} & ToastOptions

export const useToast = () => {
  return {
    toast: ({ title, description, variant, ...rest }: ToastProps) => {
      hotToast(`${title ? title + ": " : ""}${description ?? ""}`, {
        ...rest,
        style:
          variant === "destructive"
            ? { background: "#f87171", color: "white" } 
            : {},
      })
    },
  }
}
