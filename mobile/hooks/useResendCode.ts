import { useEffect, useState } from "react";

export function useResendCode(initialSeconds: number) {
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn > 0) {
      const timer = setInterval(() => {
        setResendIn((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendIn]);

  const startResendTimer = () => {
    if (resendIn > 0) return;
    setResendIn(initialSeconds);
  };

  return { resendIn, startResendTimer };
}
