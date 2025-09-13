import "client-only";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type UploadFileParams = {
  url: string;
  file: File;
};

async function uploadFile({ url, file }: UploadFileParams): Promise<void> {
  // Don't use Server Actions here because we can upload directly to S3
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });
  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
}

// NOTE: best practice https://tkdodo.eu/blog/mastering-mutations-in-react-query#some-callbacks-might-not-fire
// keep logic-related things in `useMutation` callbacks and UI things in `mutate` callbacks
// but we keep some UI stuff here for convenience
export function useUploadFile() {
  return useMutation<void, Error, UploadFileParams, unknown>({
    mutationFn: uploadFile,
    onMutate() {
      toast.loading("Your file(s) are being uploaded.");
    },
    onSuccess() {
      toast.success("File(s) uploaded successfully!");
    },
    onError(error) {
      toast.error("Uh oh! Something went wrong.", {
        description: error.message,
      });
    },
  });
}
