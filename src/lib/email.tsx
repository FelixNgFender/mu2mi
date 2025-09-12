import "server-only";
import { SES } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import PasswordResetEmail from "@/components/emails/password-reset";
import SignUpEmail from "@/components/emails/sign-up";
import { siteConfig } from "@/config";
import { env } from "@/env";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "lib/email" });

let ses: SES;

if (
  env.ENABLE_EMAIL &&
  env.AWS_REGION &&
  env.AWS_ACCESS_KEY_ID &&
  env.AWS_SECRET_ACCESS_KEY
) {
  ses = new SES({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export async function sendEmailVerificationLink(email: string, url: string) {
  if (!env.ENABLE_EMAIL) {
    log.info(`
=======================================
New email received at: ${email}
Your email verification link is: ${url}
=======================================
        `);
    return;
  }

  await ses.sendEmail({
    Source: `"${siteConfig.name}" <${siteConfig.contact}>`,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: await render(<SignUpEmail url={url} />),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Verify your email address",
      },
    },
  });
}

export async function sendPasswordResetLink(email: string, url: string) {
  if (!env.ENABLE_EMAIL) {
    log.info(`
=======================================
New email received at: ${email}
Your password reset link is: ${url}
=======================================
        `);
    return;
  }

  await ses.sendEmail({
    Source: `"${siteConfig.name}" <${siteConfig.contact}>`,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: await render(<PasswordResetEmail url={url} />),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Reset your password",
      },
    },
  });
}
