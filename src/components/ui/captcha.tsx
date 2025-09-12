"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { env } from "@/env";

// 1x00000000000000000000AA	Always passes	visible
// 2x00000000000000000000AB	Always blocks	visible
// 1x00000000000000000000BB	Always passes	invisible
// 2x00000000000000000000BB	Always blocks	invisible
// 3x00000000000000000000FF	Forces an interactive challenge	visible

const siteKey = env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || "1x00000000000000000000AB";

type CatchaProps = {
  id?: string;
  action?: string;
  size?: "normal" | "compact" | "invisible";
  className?: string;
  onScriptLoadError?: () => void;
  onError?: () => void;
  onSuccess?: (token: string) => void;
};

function CaptchaWidget({
  id,
  action,
  size = "normal",
  className,
  onScriptLoadError,
  onError,
  onSuccess,
}: CatchaProps) {
  if (!env.NEXT_PUBLIC_ENABLE_CAPTCHA) {
    return null;
  }

  return (
    <Turnstile
      id={id}
      className={className}
      siteKey={siteKey}
      options={{ action, size }}
      scriptOptions={{ onError: onScriptLoadError }}
      onError={onError}
      onSuccess={onSuccess}
    />
  );
}

export { CaptchaWidget };
