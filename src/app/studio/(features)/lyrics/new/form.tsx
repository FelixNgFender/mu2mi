"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isDefinedError } from "@orpc/client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PresetCard } from "@/components/ui/preset-card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type LYRICS_ALLOWED_MIME_TYPES,
  MIDI_ASSET_CONFIG,
  siteConfig,
} from "@/config";
import { umami } from "@/lib/analytics";
import { browserClient } from "@/lib/rpc";
import { cn } from "@/lib/utils";
import { computeSHA256 } from "@/lib/utils.client";
import {
  LYRICS_DEFAULT_BATCH_SIZE,
  LYRICS_LANGUAGES,
  LYRICS_MAX_BATCH_SIZE,
  LYRICS_MIN_BATCH_SIZE,
} from "@/types/replicate/input";
import type { Preset } from "@/types/studio";
import { useGeneratePresignedUrl } from "../../use-generate-presigned-url";
import { useUploadFile } from "../../use-upload-file";
import transcribeEnglishImage from "./assets/transcribe-english.jpg";
import transcribeJapaneseImage from "./assets/transcribe-japanese.jpg";
import translateEnglishImage from "./assets/translate-english.jpg";
import {
  type LyricsFormInput,
  type LyricsFormOutput,
  lyricsFormDefaultValues,
  lyricsFormSchema,
} from "./schema";

function uppercaseFirstLetter(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const steps = [
  {
    id: "Step 1",
    name: "Select file",
    fields: ["file"],
  },
  {
    id: "Step 2",
    name: "Preferences",
    fields: Object.keys(lyricsFormSchema.shape).filter(
      (name) => name !== "file",
    ),
  },
  { id: "Step 3", name: "Upload file" },
];

type FieldName = keyof LyricsFormInput;

export function LyricsForm() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<
    (typeof lyricsPresets)[number]["id"] | null
  >(null);
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;

  const form = useForm<LyricsFormInput, undefined, LyricsFormOutput>({
    resolver: zodResolver(lyricsFormSchema),
    defaultValues: {
      ...lyricsFormDefaultValues,
      file: null,
    },
  });

  const uploadFile = useUploadFile();
  const generatePresignedUrl = useGeneratePresignedUrl({ type: "lyrics" });

  const transcribeLyrics = useMutation(
    browserClient.track.transcribeLyrics.mutationOptions({
      onError(error) {
        window.umami?.track(umami.lyrics.failure.name, {
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
        window.umami?.track(umami.lyrics.success.name);
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

  async function onSubmit(data: LyricsFormOutput) {
    generatePresignedUrl.mutate(
      {
        type: data.file.type as (typeof LYRICS_ALLOWED_MIME_TYPES)[number],
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
              onError: () => {
                // handle upload error
                setCurrentStep(-1);
                form.reset();
              },
              onSuccess: () => {
                // chain to analyze track
                transcribeLyrics.mutate({
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

  const lyricsPresets: Preset[] = [
    {
      id: "transcribe-english",
      icon: transcribeEnglishImage,
      name: "Transcribe English lyrics",
      description:
        "Sentence-level, time-accurate transcription of English lyrics.",
      labels: ["transcribe", "english"],
      onClick: () => {
        resetAllButFile();
        form.setValue("language", "english", {
          shouldValidate: true,
        });
        setSelectedPreset("transcribe-english");
      },
    },
    {
      id: "transcribe-japanese",
      icon: transcribeJapaneseImage,
      name: "Transcribe Japanese lyrics",
      description:
        "Sentence-level, time-accurate transcription of Japanese lyrics.",
      labels: ["transcribe", "japanese"],
      onClick: () => {
        resetAllButFile();
        form.setValue("language", "japanese", {
          shouldValidate: true,
        });
        setSelectedPreset("transcribe-japanese");
      },
    },
    {
      id: "translate-english",
      icon: translateEnglishImage,
      name: "Translate to English lyrics",
      description: "Translate lyrics in any language to English.",
      labels: ["translate", "english"],
      onClick: () => {
        resetAllButFile();
        form.setValue("task", "translate", {
          shouldValidate: true,
        });
        setSelectedPreset("translate-english");
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
                            accept={MIDI_ASSET_CONFIG.allowedMimeTypes.join(
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
                          {` ${MIDI_ASSET_CONFIG.allowedFileTypes
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
                {lyricsPresets.map((item) => (
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
                      name="task"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <FormLabel>Task to perform</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col gap-y-1"
                            >
                              <FormItem className="flex items-center gap-x-3 gap-y-0">
                                <FormControl>
                                  <RadioGroupItem value="transcribe" />
                                </FormControl>
                                <FormLabel>Transcribe</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center gap-x-3 gap-y-0">
                                <FormControl>
                                  <RadioGroupItem value="translate" />
                                </FormControl>
                                <FormLabel>Translate to English</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <div className="gap-y-1 leading-none">
                            <FormLabel>Audio language</FormLabel>
                            <FormDescription>
                              {lyricsFormSchema.shape.language.description}
                            </FormDescription>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-[200px] justify-between",
                                    field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value &&
                                    uppercaseFirstLetter(field.value)}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput placeholder="Search language..." />
                                <CommandList>
                                  <CommandEmpty>
                                    No language found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {LYRICS_LANGUAGES.map((language) => (
                                      <CommandItem
                                        value={language}
                                        key={language}
                                        onSelect={() => {
                                          form.setValue("language", language);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            language === field.value
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        {field.value &&
                                          uppercaseFirstLetter(language)}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="batch_size"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <div className="gap-y-1 leading-none">
                            <FormLabel>Batch size: {field.value}</FormLabel>
                            <FormDescription>
                              {lyricsFormSchema.shape.batch_size.description}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Slider
                              onValueChange={(v) => field.onChange(v[0])}
                              value={
                                field.value
                                  ? [field.value]
                                  : [LYRICS_DEFAULT_BATCH_SIZE]
                              }
                              min={LYRICS_MIN_BATCH_SIZE}
                              max={LYRICS_MAX_BATCH_SIZE}
                              step={1}
                              className="max-w-64"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timestamp"
                      render={({ field }) => (
                        <FormItem className="gap-y-3">
                          <div className="gap-y-1 leading-none">
                            <FormLabel>Timestamp level</FormLabel>
                            <FormDescription>
                              {lyricsFormSchema.shape.timestamp.description}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col gap-y-1"
                            >
                              <FormItem className="flex items-center gap-x-3 gap-y-0">
                                <FormControl>
                                  <RadioGroupItem value="chunk" />
                                </FormControl>
                                <FormLabel>Chunk</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center gap-x-3 gap-y-0">
                                <FormControl>
                                  <RadioGroupItem value="word" />
                                </FormControl>
                                <FormLabel>Word</FormLabel>
                              </FormItem>
                            </RadioGroup>
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
                  href={siteConfig.paths.studio.lyrics.new}
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
                  href={siteConfig.paths.studio.lyrics.home}
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
              href={siteConfig.paths.studio.lyrics.new}
              className={buttonVariants({
                variant: "outline",
              })}
            >
              Transcribe new track
            </a>
            <Link
              href={siteConfig.paths.studio.lyrics.home}
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
