"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isDefinedError } from "@orpc/client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type MIDI_ALLOWED_MIME_TYPES,
  MIDI_ASSET_CONFIG,
  siteConfig,
} from "@/config";
import { umami } from "@/lib/analytics";
import { browserClient } from "@/lib/rpc";
import { cn } from "@/lib/utils";
import { computeSHA256 } from "@/lib/utils.client";
import { useGeneratePresignedUrl } from "../../use-generate-presigned-url";
import { useUploadFile } from "../../use-upload-file";
import {
  type MidiFormInput,
  type MidiFormOutput,
  midiFormDefaultValues,
  midiFormSchema,
} from "./schema";

const steps = [
  {
    id: "Step 1",
    name: "Select files",
    fields: ["files"],
  },
  { id: "Step 2", name: "Upload files" },
];

type FieldName = keyof MidiFormInput;

export function MidiForm() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;

  const form = useForm<MidiFormInput, undefined, MidiFormOutput>({
    resolver: zodResolver(midiFormSchema),
    defaultValues: { ...midiFormDefaultValues, files: null },
  });

  const uploadFile = useUploadFile();
  const generatePresignedUrl = useGeneratePresignedUrl({ type: "midi" });

  const transcribeMidi = useMutation(
    browserClient.track.transcribeMidi.mutationOptions({
      onError(error) {
        window.umami?.track(umami.midi.failure.name, {
          error,
        });
        if (isDefinedError(error) && error.code === "INPUT_VALIDATION_FAILED") {
          for (const [path, value] of Object.entries(error.data.fieldErrors)) {
            form.setError(path as FieldName, {
              type: path,
              message: value?.join(", "),
            });
          }
          setCurrentStep(-1);
          return;
        }
        toast.error("Uh oh! Something went wrong.", {
          description: error.message,
        });
        form.reset();
        setCurrentStep(-1);
      },
      onSuccess() {
        window.umami?.track(umami.midi.success.name);
        toast("🔥 We are cooking your track.");
        form.reset();
      },
    }),
  );

  async function next() {
    const fields = steps[currentStep]?.fields;
    if (!fields) return;
    const isValid = await form.trigger(fields as FieldName[], {
      shouldFocus: true,
    });

    if (!isValid) return;

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await form.handleSubmit(onSubmit)();
      }
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  }

  function prev() {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  }

  async function onSubmit(data: MidiFormOutput) {
    Promise.all(
      data.files.map(async (file) => {
        generatePresignedUrl.mutate(
          {
            type: file.type as (typeof MIDI_ALLOWED_MIME_TYPES)[number],
            extension: file.name.split(".").pop() || "",
            size: file.size,
            checksum: await computeSHA256(file),
          },
          {
            onError(error) {
              if (
                isDefinedError(error) &&
                error.code === "INPUT_VALIDATION_FAILED"
              ) {
                for (const [path, value] of Object.entries(
                  error.data.fieldErrors,
                )) {
                  form.setError(path as FieldName, {
                    type: path,
                    message: value?.join(", "),
                  });
                }
                setCurrentStep(-1);
                return;
              }
              form.reset();
              setCurrentStep(-1);
            },
            onSuccess(presignedUrl) {
              uploadFile.mutate(
                { url: presignedUrl.url, file },
                {
                  onError() {
                    form.reset();
                    setCurrentStep(-1);
                  },
                  onSuccess() {
                    // chain to transcribe midi
                    transcribeMidi.mutate({
                      name: file.name,
                      assetId: presignedUrl.assetId,
                    });
                  },
                },
              );
            },
          },
        );
      }),
    );
  }

  return (
    <>
      {/* steps */}
      <nav aria-label="Progress">
        <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, index) => (
            <li key={step.name} className="md:flex-1">
              {currentStep > index ? (
                <div className="group flex w-full flex-col border-l-4 border-primary py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-primary transition-colors">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className="flex w-full flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-primary">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : (
                <div className="group flex w-full flex-col border-l-4 border-muted-foreground py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-muted-foreground transition-colors">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form */}
      <Form {...form}>
        <form
          className="flex flex-1 flex-col"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {currentStep === 0 && (
            <motion.div
              className="flex flex-1 flex-col gap-8"
              initial={{
                x: delta >= 0 ? "50%" : "-50%",
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                Submit your tracks
              </h2>
              <Tabs defaultValue="local" className="flex flex-1 flex-col">
                <TabsList className="mb-4 self-start">
                  <TabsTrigger value="local">Local files</TabsTrigger>
                  <TabsTrigger value="remote">Remote files</TabsTrigger>
                  <TabsTrigger value="youtube">YouTube</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="local"
                  className="data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col"
                >
                  <FormField
                    name="files"
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col items-center gap-4">
                        <FormControl>
                          <Dropzone
                            classNameWrapper="w-full flex-1 max-h-64"
                            className="h-full w-full"
                            name={field.name}
                            required
                            ref={field.ref}
                            multiple
                            disabled={form.formState.isSubmitting}
                            aria-disabled={form.formState.isSubmitting}
                            accept={MIDI_ASSET_CONFIG.allowedMimeTypes.join(
                              ", ",
                            )}
                            dropMessage={
                              field.value
                                ? Array.from(field.value)
                                    .map(
                                      (file) =>
                                        // @ts-expect-error - TS doesn't know that file is a File
                                        file.name,
                                    )
                                    .join(", ")
                                : "Drop like it's hot 🔥"
                            }
                            handleOnDrop={(acceptedFiles: FileList | null) => {
                              field.onChange(acceptedFiles);
                              setFiles(acceptedFiles);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Supports:
                          {` ${MIDI_ASSET_CONFIG.allowedFileTypes
                            .map((type) => type.toUpperCase())
                            .join(", ")}`}
                        </FormDescription>
                        <FormMessage />
                        {files &&
                          Array.from(files).map((file) => {
                            return (
                              <audio
                                key={`${file.name}_${file.lastModified}`}
                                controls
                                src={URL.createObjectURL(file)}
                              >
                                <track kind="captions" />
                              </audio>
                            );
                          })}
                      </FormItem>
                    )}
                  />
                </TabsContent>
                {/* TODO: implement */}
                <TabsContent
                  value="remote"
                  className="data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col"
                >
                  remote
                </TabsContent>
                <TabsContent
                  value="youtube"
                  className="data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col"
                >
                  youtube
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              className="flex flex-1 flex-col gap-8"
              initial={{
                x: delta >= 0 ? "50%" : "-50%",
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                Submission complete
              </h2>
              <p className="leading-7 text-muted-foreground not-first:mt-6">
                Your track has been submitted for processing.{" "}
                <a
                  href={siteConfig.paths.studio.midi.new}
                  className={cn(
                    buttonVariants({
                      variant: "link",
                    }),
                    "p-0",
                  )}
                >
                  Transcribe a new track
                </a>{" "}
                or{" "}
                <Link
                  href={siteConfig.paths.studio.midi.home}
                  className={cn(
                    buttonVariants({
                      variant: "link",
                    }),
                    "p-0",
                  )}
                >
                  view the status
                </Link>{" "}
                of your newly submitted track.
              </p>
            </motion.div>
          )}
        </form>
      </Form>

      {/* Navigation */}
      <div className="flex justify-between gap-2 pb-4">
        {!form.formState.isSubmitSuccessful && (
          <>
            <Button
              type="button"
              onClick={prev}
              disabled={currentStep === 0 || form.formState.isSubmitting}
              variant="outline"
              size="icon"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              onClick={next}
              disabled={
                currentStep === steps.length - 1 || form.formState.isSubmitting
              }
              variant="outline"
              size="icon"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
            </Button>
          </>
        )}
        {form.formState.isSubmitSuccessful && (
          <>
            <a
              href={siteConfig.paths.studio.midi.new}
              className={buttonVariants({
                variant: "outline",
              })}
            >
              Transcribe new tracks
            </a>
            <Link
              href={siteConfig.paths.studio.midi.home}
              className={buttonVariants({
                variant: "outline",
              })}
            >
              View tracks
            </Link>
          </>
        )}
      </div>
    </>
  );
}
