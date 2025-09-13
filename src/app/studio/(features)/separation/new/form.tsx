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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PresetCard } from "@/components/ui/preset-card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type SEPARATION_ALLOWED_MIME_TYPES,
  SEPARATION_ASSET_CONFIG,
  siteConfig,
} from "@/config";
import { umami } from "@/lib/analytics";
import { browserClient } from "@/lib/rpc";
import { cn } from "@/lib/utils";
import { computeSHA256 } from "@/lib/utils.client";
import { SEPARATION_MODELS } from "@/types/replicate/input";
import type { Preset } from "@/types/studio";
import { useGeneratePresignedUrl } from "../../use-generate-presigned-url";
import { useUploadFile } from "../../use-upload-file";
import fourStemsImage from "./assets/four-stems.jpg";
import sixStemsImage from "./assets/six-stems.jpg";
import twoStemsImage from "./assets/two-stems.jpg";
import {
  type SeparationFormInput,
  type SeparationFormOutput,
  separationDefaultValues,
  separationFormSchema,
} from "./schema";

const steps = [
  {
    id: "Step 1",
    name: "Select file",
    fields: ["file"],
  },
  {
    id: "Step 2",
    name: "Preferences",
    fields: Object.keys(separationFormSchema.shape).filter(
      (name) => name !== "file",
    ),
  },
  { id: "Step 3", name: "Upload file" },
];

type FieldName = keyof SeparationFormInput;

export function SeparationForm() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<
    (typeof separationPresets)[number]["id"] | null
  >(null);
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;

  const form = useForm<SeparationFormInput, undefined, SeparationFormOutput>({
    resolver: zodResolver(separationFormSchema),
    defaultValues: {
      ...separationDefaultValues,
      file: null,
    },
  });

  const uploadFile = useUploadFile();
  const generatePresignedUrl = useGeneratePresignedUrl({ type: "separation" });

  function handleUnknownError(error: Error) {
    toast.error("Uh oh! Something went wrong.", {
      description: error.message,
    });
    form.reset();
    setCurrentStep(-1);
  }

  const separateTrack = useMutation(
    browserClient.track.separateTrack.mutationOptions({
      onError(error) {
        window.umami?.track(umami.separation.failure.name, {
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
        handleUnknownError(error);
      },
      onSuccess() {
        window.umami?.track(umami.separation.success.name);
        toast("🔥 We are cooking your track.");
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

  async function onSubmit(data: SeparationFormOutput) {
    generatePresignedUrl.mutate(
      {
        type: data.file.type as (typeof SEPARATION_ALLOWED_MIME_TYPES)[number],
        extension: data.file.name.split(".").pop() || "",
        size: data.file.size,
        checksum: await computeSHA256(data.file),
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
          handleUnknownError(error);
        },
        onSuccess(presignedUrl) {
          // chain to upload file
          uploadFile.mutate(
            { url: presignedUrl.url, file: data.file },
            {
              onError(error) {
                handleUnknownError(error);
              },
              onSuccess() {
                // chain to separate track
                const { file: _, ...rest } = data;
                separateTrack.mutate({
                  ...rest,
                  name: data.file.name,
                  assetId: presignedUrl.assetId,
                });
              },
            },
          );
        },
      },
    );
  }

  function resetAllButFile() {
    form.reset({
      file: form.getValues("file"),
    });
  }

  const separationPresets: Preset[] = [
    {
      id: "two-stems",
      icon: twoStemsImage,
      name: "Two stems",
      description: "Separate your track into vocals and accompaniment.",
      labels: ["vocals", "accompaniment"],
      onClick: () => {
        resetAllButFile();
        form.setValue("model", "htdemucs", {
          shouldValidate: true,
        });
        form.setValue("stem", "vocals", {
          shouldValidate: true,
        });
        setSelectedPreset("two-stems");
      },
    },
    {
      id: "two-stems-finetuned",
      icon: twoStemsImage,
      name: "Two stems (finetuned)",
      description: "Same as two stems. Takes longer but improves quality.",
      labels: ["vocals", "accompaniment"],
      onClick: () => {
        resetAllButFile();
        form.setValue("model", "htdemucs_ft", {
          shouldValidate: true,
        });
        form.setValue("stem", "vocals", {
          shouldValidate: true,
        });
        setSelectedPreset("two-stems-finetuned");
      },
    },
    {
      id: "four-stems",
      icon: fourStemsImage,
      name: "Four stems",
      description:
        "Separate your track into vocals, accompaniment, bass, and drums.",
      labels: ["vocals", "accompaniment", "bass", "drums"],
      onClick: () => {
        resetAllButFile();
        form.setValue("model", "htdemucs", {
          shouldValidate: true,
        });
        setSelectedPreset("four-stems");
      },
    },
    {
      id: "four-stems-finetuned",
      icon: fourStemsImage,
      name: "Four stems (finetuned)",
      description: "Same as four stems. Takes longer but improves quality.",
      labels: ["vocals", "accompaniment", "bass", "drums"],
      onClick: () => {
        resetAllButFile();
        form.setValue("model", "htdemucs_ft", {
          shouldValidate: true,
        });
        setSelectedPreset("four-stems-finetuned");
      },
    },
    {
      id: "six-stems",
      icon: sixStemsImage,
      name: "Six stems",
      description:
        "Separate your track into vocals, accompaniment, bass, drums, guitar, and piano.",
      labels: ["vocals", "accompaniment", "bass", "drums", "guitar", "piano"],
      onClick: () => {
        resetAllButFile();
        form.setValue("model", "htdemucs_6s", {
          shouldValidate: true,
        });
        setSelectedPreset("six-stems");
      },
    },
  ];

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
              className="flex flex-1 flex-col gap-y-8"
              initial={{
                x: delta >= 0 ? "50%" : "-50%",
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                Submit your track
              </h2>
              <Tabs defaultValue="local" className="flex flex-1 flex-col">
                <TabsList className="mb-4 self-start">
                  <TabsTrigger value="local">Local file</TabsTrigger>
                  <TabsTrigger value="remote">Remote file</TabsTrigger>
                  <TabsTrigger value="youtube">YouTube</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="local"
                  className="data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col"
                >
                  <FormField
                    name="file"
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col items-center gap-y-4">
                        <FormControl>
                          <Dropzone
                            classNameWrapper="w-full flex-1 max-h-64"
                            className="h-full w-full"
                            name={field.name}
                            required
                            ref={field.ref}
                            disabled={form.formState.isSubmitting}
                            aria-disabled={form.formState.isSubmitting}
                            accept={SEPARATION_ASSET_CONFIG.allowedMimeTypes.join(
                              ", ",
                            )}
                            dropMessage={
                              field.value
                                ? field.value[0]?.name
                                : "Drop like it's hot 🔥"
                            }
                            handleOnDrop={(acceptedFiles: FileList | null) => {
                              const file = acceptedFiles?.[0] ?? null;
                              field.onChange(file);
                              setFile(file);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Supports:{" "}
                          {` ${SEPARATION_ASSET_CONFIG.allowedFileTypes
                            .map((type) => type.toUpperCase())
                            .join(", ")}`}
                        </FormDescription>
                        <FormMessage />
                        {file && (
                          <audio controls src={URL.createObjectURL(file)}>
                            <track kind="captions" />
                          </audio>
                        )}
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
              className="flex flex-1 flex-col gap-y-8"
              initial={{
                x: delta >= 0 ? "50%" : "-50%",
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                Choose a preset
              </h2>
              <div className="flex flex-col gap-y-4 p-4 pt-0">
                {separationPresets.map((item) => (
                  <PresetCard
                    key={item.id}
                    item={item}
                    selectedItemId={selectedPreset}
                  />
                ))}
              </div>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Custom options</AccordionTrigger>
                  <AccordionContent className="flex flex-1 flex-col gap-y-8 p-4">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <FormLabel>Model</FormLabel>
                          <FormDescription>
                            Choose a model to separate your track with.
                          </FormDescription>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col gap-y-1"
                            >
                              {SEPARATION_MODELS.map((model) => (
                                <FormItem
                                  key={model.name}
                                  className="flex items-center gap-x-3 gap-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem value={model.name} />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {model.name}
                                  </FormLabel>
                                  <FormDescription className="no-scrollbar overflow-x-auto whitespace-nowrap text-sm">
                                    {model.description}
                                  </FormDescription>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stem"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <FormLabel>Separate into stem</FormLabel>
                          <FormDescription>
                            Only separate audio into the chosen stem and others
                            (no stem). Optional.
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                {field.value ? (
                                  <SelectValue placeholder="Choose a stem" />
                                ) : (
                                  "Choose a stem"
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                "vocals",
                                "bass",
                                "drums",
                                "guitar",
                                "piano",
                                "other",
                              ].map((stem) => (
                                <SelectItem key={stem} value={stem}>
                                  {stem[0]?.toUpperCase() + stem.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clip_mode"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <FormLabel>Clip mode</FormLabel>
                          <FormDescription>
                            Strategy for avoiding clipping: rescaling entire
                            signal if necessary (rescale) or hard clipping
                            (clamp).
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose clip mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["rescale", "clamp"].map((clipMode) => (
                                <SelectItem key={clipMode} value={clipMode}>
                                  {clipMode[0]?.toUpperCase() +
                                    clipMode.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shifts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shifts</FormLabel>
                          <FormDescription>
                            Number of random shifts for equivariant
                            stabilization. Increase separation time but improves
                            quality of track separation.
                          </FormDescription>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={form.formState.isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="overlap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overlap</FormLabel>
                          <FormDescription>
                            Overlap between the splits.
                          </FormDescription>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={form.formState.isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="output_format"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <FormLabel>Output format</FormLabel>
                          <FormDescription>
                            Format of the output file.
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose output format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["mp3", "wav", "flac"].map((format) => (
                                <SelectItem key={format} value={format}>
                                  {format.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mp3_bitrate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MP3 bitrate</FormLabel>
                          <FormDescription>
                            Bitrate of the converted MP3 track.
                          </FormDescription>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={form.formState.isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              className="flex flex-1 flex-col gap-y-8"
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
                  href={siteConfig.paths.studio.separation.new}
                  className={cn(
                    buttonVariants({
                      variant: "link",
                    }),
                    "p-0",
                  )}
                >
                  Separate a new track
                </a>{" "}
                or{" "}
                <Link
                  href={siteConfig.paths.studio.separation.home}
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
      <div className="flex justify-between gap-x-2 pb-4">
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
              href={siteConfig.paths.studio.separation.new}
              className={buttonVariants({
                variant: "outline",
              })}
            >
              Separate new track
            </a>
            <Link
              href={siteConfig.paths.studio.separation.home}
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
