import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect, useState } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <ToastWithTimer 
            key={id} 
            id={id}
            title={title}
            description={description}
            action={action}
            dismiss={dismiss}
            {...props}
          />
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

function ToastWithTimer({ id, title, description, action, dismiss, ...props }: any) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          dismiss(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [id, dismiss])

  return (
    <Toast {...props}>
      <div className="grid gap-1 flex-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && (
          <ToastDescription>{description}</ToastDescription>
        )}
      </div>
      <div className="text-sm font-semibold text-gray-600 ml-4">
        {countdown}s
      </div>
      {action}
      <ToastClose />
    </Toast>
  )
}
