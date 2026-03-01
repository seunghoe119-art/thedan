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
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, duration, ...props }) {
        return (
          <ToastWithTimer 
            key={id} 
            id={id}
            title={title}
            description={description}
            action={action}
            duration={duration}
            {...props} 
          />
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

function ToastWithTimer({ id, title, description, action, duration, ...props }: any) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (duration && typeof duration === 'number' && duration < 1000000) {
      setTimeLeft(Math.ceil(duration / 1000));
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 1000);

      return () => clearInterval(interval);
    } else if (!duration) {
      // Default duration for shadcn toast is usually 5000ms
      const defaultDuration = 5000;
      setTimeLeft(Math.ceil(defaultDuration / 1000));
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((defaultDuration - elapsed) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [duration]);

  return (
    <Toast {...props}>
      <div className="grid gap-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && (
          <ToastDescription>
            {description}
            {timeLeft !== null && timeLeft > 0 && (
              <span className="ml-2 text-xs opacity-70">({timeLeft}초 후 닫힘)</span>
            )}
          </ToastDescription>
        )}
      </div>
      {action}
      <ToastClose />
    </Toast>
  );
}
