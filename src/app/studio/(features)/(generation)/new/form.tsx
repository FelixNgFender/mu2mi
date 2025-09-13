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
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  type GENERATION_ALLOWED_MIME_TYPES,
  GENERATION_ASSET_CONFIG,
  siteConfig,
} from "@/config";
import { umami } from "@/lib/analytics";
import { browserClient } from "@/lib/rpc";
import { cn } from "@/lib/utils";
import { computeSHA256 } from "@/lib/utils.client";
import {
  GENERATION_DEFAULT_DURATION,
  GENERATION_MAX_DURATION,
  GENERATION_MIN_DURATION,
  GENERATION_MODELS,
  GENERATION_NORMALIZATION_STRATEGIES,
  GENERATION_OUTPUT_FORMATS,
} from "@/types/replicate/input";
import type { Preset } from "@/types/studio";
import { useGeneratePresignedUrl } from "../../use-generate-presigned-url";
import { useUploadFile } from "../../use-upload-file";
import melodyLargeImage from "./assets/melody-large.jpg";
import stereoMelodyImage from "./assets/stereo-melody-large.jpg";
import {
  type GenerationFormInput,
  type GenerationFormOutput,
  generationFormDefaultValues,
  generationFormSchema,
} from "./schema";

const steps = [
  {
    id: "Step 1",
    name: "Preferences",
    fields: Object.keys(generationFormSchema.shape).filter(
      (name) => name !== "file",
    ),
  },
  { id: "Step 2", name: "Generate track" },
];

type FieldName = keyof GenerationFormInput;

export function GenerationForm() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;

  const form = useForm<GenerationFormInput, undefined, GenerationFormOutput>({
    resolver: zodResolver(generationFormSchema),
    defaultValues: generationFormDefaultValues,
  });

  const uploadFile = useUploadFile();
  const generatePresignedUrl = useGeneratePresignedUrl({ type: "generation" });

  function handleUnknownError(error: Error) {
    toast.error("Uh oh! Something went wrong.", {
      description: error.message,
    });
    form.reset();
    setCurrentStep(-1);
  }

  const generateMusic = useMutation(
    browserClient.track.generateMusic.mutationOptions({
      onError(error) {
        window.umami?.track(umami.generation.failure.name, {
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
        window.umami?.track(umami.generation.success.name);
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

  async function onSubmit(data: GenerationFormOutput) {
    if (!data.file) {
      // upload without asset
      generateMusic.mutate({
        ...data,
        name: data.prompt,
      });
      return;
    }

    generatePresignedUrl.mutate(
      {
        type: data.file.type as (typeof GENERATION_ALLOWED_MIME_TYPES)[number],
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
            { url: presignedUrl.url, file: data.file as File }, // guaranteed to be not null because of the guard above
            {
              onError(error) {
                handleUnknownError(error);
              },
              onSuccess() {
                // chain to generate music
                const { file: _, ...rest } = data;
                generateMusic.mutate({
                  ...rest,
                  name: data.prompt,
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

  const generationPresets: Preset[] = [
    {
      id: "melody-large",
      icon: melodyLargeImage,
      name: "Default",
      description:
        "Text-to-music or melody-to-music. Uses the 'melody-large' model.",
      labels: ["text-to-music", "melody-to-music"],
      onClick: () => {
        resetAllButFile();
        setSelectedPreset("melody-large");
      },
    },
    {
      id: "stereo-melody-large",
      icon: stereoMelodyImage,
      name: "Stereo",
      description: "Same as default, but fine-tuned for stereo generation.",
      labels: ["text-to-music", "melody-to-music", "stereo"],
      onClick: () => {
        resetAllButFile();
        form.setValue("model_version", "stereo-melody-large", {
          shouldValidate: true,
        });
        setSelectedPreset("stereo-melody-large");
      },
    },
  ];

  return (
    <>
      {/* steps */}
      <nav aria-label="Progress">
        <ol className="gap-y-4 md:flex md:gap-y-8 md:gap-x-0">
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
                Choose a preset
              </h2>
              <div className="flex flex-col gap-y-4 p-4 pt-0">
                {generationPresets.map((item) => (
                  <PresetCard
                    key={item.id}
                    item={item}
                    selectedItemId={selectedPreset}
                  />
                ))}
              </div>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="gap-y-3">
                    <FormLabel>Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="110bpm 64kbps 16khz lofi hiphop summer smooth"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {generationFormSchema.shape.prompt.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Custom options</AccordionTrigger>
                  <AccordionContent className="flex flex-1 flex-col gap-y-8 p-4">
                    <FormField
                      control={form.control}
                      name="model_version"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <FormLabel>Model version</FormLabel>
                          <FormDescription>
                            {
                              generationFormSchema.shape.model_version
                                .description
                            }
                          </FormDescription>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col gap-y-1"
                            >
                              {GENERATION_MODELS.map((model) => (
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
                      name="file"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <FormLabel>Input audio</FormLabel>
                          <FormDescription>
                            {generationFormSchema.shape.file.description}
                          </FormDescription>
                          <FormControl>
                            <Input
                              type="file"
                              name={field.name}
                              ref={field.ref}
                              disabled={form.formState.isSubmitting}
                              aria-disabled={form.formState.isSubmitting}
                              accept={GENERATION_ASSET_CONFIG.allowedMimeTypes.join(
                                ", ",
                              )}
                              placeholder="Choose a file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                field.onChange(file);
                                setFile(file);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          {file && (
                            <audio controls src={URL.createObjectURL(file)}>
                              <track kind="captions" />
                            </audio>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <div className="gap-y-1 leading-none">
                            <FormLabel>
                              Duration: {field.value} seconds
                            </FormLabel>
                            <FormDescription>
                              {generationFormSchema.shape.duration.description}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Slider
                              {...field}
                              onValueChange={(v) => field.onChange(v[0])}
                              value={
                                field.value
                                  ? [field.value]
                                  : [GENERATION_DEFAULT_DURATION]
                              }
                              min={GENERATION_MIN_DURATION}
                              max={GENERATION_MAX_DURATION}
                              step={1}
                              className="max-w-64"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="continuation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-x-3 gap-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="gap-y-1 leading-none">
                            <FormLabel>Continuation</FormLabel>
                            <FormDescription>
                              {
                                generationFormSchema.shape.continuation
                                  .description
                              }
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="continuation_start"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Continuation start</FormLabel>
                          <FormDescription>
                            {
                              generationFormSchema.shape.continuation_start
                                .description
                            }
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
                      name="continuation_end"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Continuation end</FormLabel>
                          <FormDescription>
                            {
                              generationFormSchema.shape.continuation_end
                                .description
                            }
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
                      name="multi_band_diffusion"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-x-3 gap-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="gap-y-1 leading-none">
                            <FormLabel>Multi-band diffusion</FormLabel>
                            <FormDescription>
                              {
                                generationFormSchema.shape.multi_band_diffusion
                                  .description
                              }
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="normalization_strategy"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <FormLabel>Clip mode</FormLabel>
                          <FormDescription>
                            {
                              generationFormSchema.shape.normalization_strategy
                                .description
                            }
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose normalization strategy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GENERATION_NORMALIZATION_STRATEGIES.map(
                                (normStrat) => (
                                  <SelectItem key={normStrat} value={normStrat}>
                                    {normStrat[0]?.toUpperCase() +
                                      normStrat.slice(1)}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="top_k"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Top k</FormLabel>
                          <FormDescription>
                            {generationFormSchema.shape.top_k.description}
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
                      name="top_p"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Top p</FormLabel>
                          <FormDescription>
                            {generationFormSchema.shape.top_p.description}
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
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature</FormLabel>
                          <FormDescription>
                            {generationFormSchema.shape.temperature.description}
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
                      name="classifier_free_guidance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Classifier-free guidance</FormLabel>
                          <FormDescription>
                            {
                              generationFormSchema.shape
                                .classifier_free_guidance.description
                            }
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
                      name="seed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seed</FormLabel>
                          <FormDescription>
                            {generationFormSchema.shape.seed.description}
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
                            {
                              generationFormSchema.shape.output_format
                                .description
                            }
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
                              {GENERATION_OUTPUT_FORMATS.map((format) => (
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
                Submission complete
              </h2>
              <p className="leading-7 text-muted-foreground not-first:mt-6">
                Your track is generating.{" "}
                <a
                  href={siteConfig.paths.studio.generation.new}
                  className={cn(
                    buttonVariants({
                      variant: "link",
                    }),
                    "p-0",
                  )}
                >
                  Generate a new track
                </a>{" "}
                or{" "}
                <Link
                  href={siteConfig.paths.studio.generation.home}
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
              href={siteConfig.paths.studio.generation.new}
              className={buttonVariants({
                variant: "outline",
              })}
            >
              Generate new track
            </a>
            <Link
              href={siteConfig.paths.studio.generation.home}
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
