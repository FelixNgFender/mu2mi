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
import { Checkbox } from "@/components/ui/checkbox";
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
import { PresetCard } from "@/components/ui/preset-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "@/config";
import {
  type ANALYSIS_ALLOWED_MIME_TYPES,
  ANALYSIS_ASSET_CONFIG,
} from "@/config/asset";
import { umami } from "@/lib/analytics";
import { browserClient } from "@/lib/rpc";
import { cn } from "@/lib/utils";
import { computeSHA256 } from "@/lib/utils.client";
import { ANALYSIS_MODELS } from "@/types/replicate/input";
import type { Preset } from "@/types/studio";
import { useGeneratePresignedUrl } from "../../use-generate-presigned-url";
import { useUploadFile } from "../../use-upload-file";
import allImage from "./assets/all.jpg";
import defaultPresetImage from "./assets/default.jpg";
import withSonificationImage from "./assets/with-sonification.jpg";
import withVisualizationImage from "./assets/with-visualization.jpg";
import {
  type AnalysisFormInput,
  type AnalysisFormOutput,
  analysisFormDefaultValues,
  analysisFormSchema,
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
    fields: Object.keys(analysisFormSchema.shape).filter(
      (name) => name !== "file",
    ),
  },
  { id: "Step 3", name: "Upload file" },
];

type FieldName = keyof AnalysisFormInput;

export function AnalysisForm() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;

  const form = useForm<AnalysisFormInput, undefined, AnalysisFormOutput>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: { ...analysisFormDefaultValues, file: null },
  });

  const uploadFile = useUploadFile();
  const generatePresignedUrl = useGeneratePresignedUrl({ type: "analysis" });

  const analyzeTrack = useMutation(
    browserClient.track.analyzeTrack.mutationOptions({
      onError(error) {
        window.umami?.track(umami.analysis.failure.name, {
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
        window.umami?.track(umami.analysis.success.name);
        toast("File uploaded successfully.", {
          description: "🔥 We are cooking your track.",
        });
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

  async function onSubmit(data: AnalysisFormOutput) {
    generatePresignedUrl.mutate(
      {
        type: data.file.type as (typeof ANALYSIS_ALLOWED_MIME_TYPES)[number],
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
          setCurrentStep(-1);
          form.reset();
        },
        onSuccess(presignedUrl) {
          // chain to upload file
          uploadFile.mutate(
            { url: presignedUrl.url, file: data.file },
            {
              onError() {
                // handle upload error
                setCurrentStep(-1);
                form.reset();
              },
              onSuccess() {
                // chain to analyze track
                analyzeTrack.mutate({
                  ...data,
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

  const analysisPresets: Preset[] = [
    {
      id: "default",
      icon: defaultPresetImage,
      name: "Default",
      description:
        "Analyzes the track's musical structure (tempo, beats, downbeats, section boundaries, and segment labels).",
      labels: ["analysis"],
      onClick: () => {
        resetAllButFile();
        setSelectedPreset("default");
      },
    },
    {
      id: "with-visualization",
      icon: withVisualizationImage,
      name: "With visualization",
      description:
        "Same as default. Also includes a visualization of the track's musical structure.",
      labels: ["analysis", "visualization"],
      onClick: () => {
        resetAllButFile();
        form.setValue("visualize", true, {
          shouldValidate: true,
        });
        setSelectedPreset("with-visualization");
      },
    },
    {
      id: "with-sonification",
      icon: withSonificationImage,
      name: "With sonification",
      description:
        "Same as default. Also includes a mix of a click track with section callouts and the original audio.",
      labels: ["analysis", "sonification"],
      onClick: () => {
        resetAllButFile();
        form.setValue("sonify", true, {
          shouldValidate: true,
        });
        setSelectedPreset("with-sonification");
      },
    },
    {
      id: "all",
      icon: allImage,
      name: "All",
      description: "Includes all available data.",
      labels: ["analysis", "sonification", "visualization"],
      onClick: () => {
        resetAllButFile();
        form.setValue("sonify", true, {
          shouldValidate: true,
        });
        form.setValue("visualize", true, {
          shouldValidate: true,
        });
        setSelectedPreset("all");
      },
    },
  ];

  return (
    <>
      {/* steps */}
      <nav aria-label="Progress">
        <ol className="gap-y-4 md:flex md:gap-x-8 md:gap-y-0">
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
                            accept={ANALYSIS_ASSET_CONFIG.allowedMimeTypes.join(
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
                          Supports:
                          {` ${ANALYSIS_ASSET_CONFIG.allowedFileTypes
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
                {analysisPresets.map((item) => (
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
                          <FormLabel>Model name</FormLabel>
                          <FormDescription>
                            {analysisFormSchema.shape.model.description}
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ANALYSIS_MODELS.map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
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
                      name="visualize"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-x-3 gap-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="gap-y-1 leading-none">
                            <FormLabel>Visualize track</FormLabel>
                            <FormDescription>
                              {analysisFormSchema.shape.visualize.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sonify"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-x-3 gap-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="gap-y-1 leading-none">
                            <FormLabel>Sonify track</FormLabel>
                            <FormDescription>
                              {analysisFormSchema.shape.sonify.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="activ"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-x-3 gap-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="gap-y-1 leading-none">
                            <FormLabel>Save activations</FormLabel>
                            <FormDescription>
                              {analysisFormSchema.shape.activ.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="include_activations"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-x-3 gap-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="gap-y-1 leading-none">
                            <FormLabel>Include activations</FormLabel>
                            <FormDescription>
                              {
                                analysisFormSchema.shape.include_activations
                                  .description
                              }
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="include_embeddings"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-x-3 gap-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="gap-y-1 leading-none">
                            <FormLabel>Include embeddings</FormLabel>
                            <FormDescription>
                              {
                                analysisFormSchema.shape.include_embeddings
                                  .description
                              }
                            </FormDescription>
                          </div>
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
                  href={siteConfig.paths.studio.analysis.new}
                  className={cn(
                    buttonVariants({
                      variant: "link",
                    }),
                    "p-0",
                  )}
                >
                  Analyze a new track
                </a>{" "}
                or{" "}
                <Link
                  href={siteConfig.paths.studio.analysis.home}
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
              href={siteConfig.paths.studio.analysis.new}
              className={buttonVariants({
                variant: "outline",
              })}
            >
              Analyze new track
            </a>
            <Link
              href={siteConfig.paths.studio.analysis.home}
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
