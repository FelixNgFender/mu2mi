import crypto from "node:crypto";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateObjectKey(extension: string) {
  return `${crypto.randomBytes(32).toString("hex")}${extension}`;
}
