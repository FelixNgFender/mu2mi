import { z } from "zod";

export const webhookMetadataSchema = z.object({
  trackId: z.coerce.number(),
  userId: z.string(),
});

export type WebhookMetadataSchema = z.infer<typeof webhookMetadataSchema>;

export const GENERATION_MODELS = [
  {
    name: "large",
    description: "3.3B model, text to music only.",
  },
  {
    name: "melody-large",
    description: "3.3B model, text to music and text & melody to music.",
  },
  {
    name: "stereo-large",
    description: "Same as 'large', fine-tuned for stereo generation.",
  },
  {
    name: "stereo-melody-large",
    description: "Same as 'melody-large', fine-tuned for stereo generation.",
  },
  {
    name: "encode-decode",
    description:
      "The uploaded audio specified will simply be encoded and then decoded.",
  },
] as const;
export const GENERATION_DEFAULT_MODEL = "stereo-melody-large" as const;
export const GENERATION_MIN_DURATION = 1 as const;
export const GENERATION_MAX_DURATION = 60 as const;
export const GENERATION_DEFAULT_DURATION = 8 as const;
export const GENERATION_DEFAULT_CONTINUATION = false as const;
export const GENERATION_DEFAULT_MULTI_BAND_DIFFUSION = false as const;
export const GENERATION_NORMALIZATION_STRATEGIES = [
  "loudness",
  "clip",
  "peak",
  "rms",
] as const;
export const GENERATION_DEFAULT_NORMALIZATION_STRATEGY = "loudness" as const;
export const GENERATION_DEFAULT_TOP_K = 250 as const;
export const GENERATION_DEFAULT_TOP_P = 0 as const;
export const GENERATION_DEFAULT_TEMPERATURE = 1 as const;
export const GENERATION_DEFAULT_CLASSIFIER_FREE_GUIDANCE = 3 as const;
export const GENERATION_OUTPUT_FORMATS = ["mp3", "wav"] as const;
export const GENERATION_DEFAULT_OUTPUT_FORMAT = "mp3" as const;

export const generationSchema = z.object({
  input_audio: z
    .url()
    .optional()
    .describe(
      "An audio file that will influence the generated music. If `continuation` is `True`, the generated music will be a continuation of the audio file. Otherwise, the generated music will mimic the audio file's melody.",
    ),
  model_version: z
    .enum(GENERATION_MODELS.map((model) => model.name))
    .default(GENERATION_DEFAULT_MODEL)
    .describe("Model to use for generation"),
  prompt: z
    .string()
    .describe("A description of the music you want to generate."),
  duration: z
    .int()
    .min(GENERATION_MIN_DURATION)
    .max(GENERATION_MAX_DURATION)
    .default(GENERATION_DEFAULT_DURATION)
    .describe("Duration of the generated audio in seconds."),
  continuation: z
    .boolean()
    .default(false)
    .describe(
      "If `True`, generated music will continue from `input_audio`. Otherwise, generated music will mimic `input_audio`'s melody.",
    ),
  continuation_start: z
    .int()
    .min(0)
    .optional()
    .describe("Start time of the audio file to use for continuation."),
  continuation_end: z
    .int()
    .min(0)
    .optional()
    .describe(
      "End time of the audio file to use for continuation. If -1 or None, will default to the end of the audio clip.",
    ),
  multi_band_diffusion: z
    .boolean()
    .default(GENERATION_DEFAULT_MULTI_BAND_DIFFUSION)
    .describe(
      "If `True`, the EnCodec tokens will be decoded with MultiBand Diffusion. Only works with non-stereo models.",
    ),
  normalization_strategy: z
    .enum(GENERATION_NORMALIZATION_STRATEGIES)
    .default(GENERATION_DEFAULT_NORMALIZATION_STRATEGY)
    .describe("Strategy for normalizing audio."),
  top_k: z
    .int()
    .default(GENERATION_DEFAULT_TOP_K)
    .describe("Reduces sampling to the k most likely tokens."),
  top_p: z
    .number()
    .default(GENERATION_DEFAULT_TOP_P)
    .describe(
      "Reduces sampling to tokens with cumulative probability of p. When set to `0` (default), top_k sampling is used.",
    ),
  temperature: z
    .number()
    .default(GENERATION_DEFAULT_TEMPERATURE)
    .describe(
      "Controls the 'conservativeness' of the sampling process. Higher temperature means more diversity.",
    ),
  classifier_free_guidance: z
    .int()
    .default(GENERATION_DEFAULT_CLASSIFIER_FREE_GUIDANCE)
    .describe(
      "Increases the influence of inputs on the output. Higher values produce lower-varience outputs that adhere more closely to inputs.",
    ),
  output_format: z
    .enum(GENERATION_OUTPUT_FORMATS)
    .default(GENERATION_DEFAULT_OUTPUT_FORMAT)
    .describe("Output format for generated audio."),
  seed: z
    .int()
    .optional()
    .describe(
      "Seed for random number generator. If None or -1, a random seed will be used.",
    ),
});

export type GenerationSchema = z.infer<typeof generationSchema>;

export const SEPARATION_MODELS = [
  {
    name: "htdemucs",
    description:
      "First version of Hybrid Transformer Demucs. Trained on MusDB + 800 songs. Default model.",
  },
  {
    name: "htdemucs_ft",
    description:
      "Fine-tuned version of htdemucs, separation will take 4 times more time but might be a bit better. Same training set as htdemucs.",
  },
  {
    name: "htdemucs_6s",
    description:
      "6 sources version of htdemucs, with piano and guitar being added as sources. Note that the piano source is not working great at the moment.",
  },
  {
    name: "hdemucs_mmi",
    description: "Hybrid Demucs v3, retrained on MusDB + 800 songs.",
  },
  {
    name: "mdx_q",
    description:
      "Quantized version of the previous models. Smaller download and storage but quality can be slightly worse.",
  },
  {
    name: "mdx_extra_q",
    description:
      "Quantized version of the previous models. Smaller download and storage but quality can be slightly worse.",
  },
] as const;
export const SEPARATION_DEFAULT_MODEL = "htdemucs" as const;
export const SEPARATION_STEMS = [
  "vocals",
  "bass",
  "drums",
  "guitar",
  "piano",
  "other",
] as const;
export const SEPARATION_CLIP_MODES = ["rescale", "clamp"] as const;
export const SEPARATION_DEFAULT_CLIP_MODE = "rescale" as const;
export const SEPARATION_MIN_JOBS = 1 as const;
export const SEPARATION_DEFAULT_JOBS = 1 as const;
export const SEPARATION_DEFAULT_SPLIT = true as const;
export const SEPARATION_MIN_SHIFTS = 1 as const;
export const SEPARATION_MAX_SHIFTS = 10 as const;
export const SEPARATION_DEFAULT_SHIFTS = 1 as const;
export const SEPARATION_DEFAULT_OVERLAP = 0.25 as const;
export const SEPARATION_OUTPUT_FORMATS = ["mp3", "wav", "flac"] as const;
export const SEPARATION_DEFAULT_OUTPUT_FORMAT = "mp3" as const;
export const SEPARATION_DEFAULT_MP3_PRESET = 2 as const;
export const SEPARATION_DEFAULT_WAV_FORMAT = "int24" as const;
export const SEPARATION_DEFAULT_MP3_BITRATE = 320 as const;

export const separationSchema = z.object({
  audio: z.url().describe("Upload the file to be processed here."),
  model: z
    .enum(SEPARATION_MODELS.map((model) => model.name))
    .default(SEPARATION_DEFAULT_MODEL)
    .describe("Choose the demucs audio that proccesses your audio."),
  stem: z
    .enum(SEPARATION_STEMS)
    .optional()
    .describe("If you just want to isolate one stem, you can choose it here."),
  clip_mode: z
    .enum(SEPARATION_CLIP_MODES)
    .default(SEPARATION_DEFAULT_CLIP_MODE)
    .describe(
      "Choose the strategy for avoiding clipping. Rescale will rescale entire signal if necessary or clamp will allow hard clipping.",
    ),
  jobs: z
    .int()
    .min(SEPARATION_MIN_JOBS)
    .default(SEPARATION_DEFAULT_JOBS)
    .describe("Choose the number of parallel jobs to use for separation."),
  split: z
    .boolean()
    .default(SEPARATION_DEFAULT_SPLIT)
    .describe("Choose whether or not the audio should be split into chunks."),
  shifts: z
    .int()
    .min(SEPARATION_MIN_SHIFTS)
    .max(SEPARATION_MAX_SHIFTS)
    .default(SEPARATION_DEFAULT_SHIFTS)
    .describe(
      "Choose the amount random shifts for equivariant stabilization. This performs multiple predictions with random shifts of the input and averages them, which makes it x times slower.",
    ),
  overlap: z
    .number()
    .default(SEPARATION_DEFAULT_OVERLAP)
    .describe("Choose the amount of overlap between prediction windows."),
  segment: z
    .int()
    .optional()
    .describe("Choose the segment length to use for separation."),
  output_format: z
    .enum(SEPARATION_OUTPUT_FORMATS)
    .default(SEPARATION_DEFAULT_OUTPUT_FORMAT)
    .describe(
      "Choose the audio format you would like the result to be returned in.",
    ),
  mp3_preset: z
    .int()
    .default(SEPARATION_DEFAULT_MP3_PRESET)
    .describe(
      "Choose the preset for the MP3 output. Higher is faster but worse quality. If MP3 is not selected as the output type, this has no effect.",
    ),
  wav_format: z
    .string()
    .default(SEPARATION_DEFAULT_WAV_FORMAT)
    .describe(
      "Choose format for the WAV output. If WAV is not selected as the output type, this has no effect.",
    ),
  mp3_bitrate: z
    .int()
    .default(SEPARATION_DEFAULT_MP3_BITRATE)
    .describe(
      "Choose the bitrate for the MP3 output. Higher is better quality but larger file size. If MP3 is not selected as the output type, this has no effect.",
    ),
});

export type SeparationSchema = z.infer<typeof separationSchema>;

export const ANALYSIS_MODELS = [
  "harmonix-all",
  "harmonix-fold0",
  "harmonix-fold1",
  "harmonix-fold2",
  "harmonix-fold3",
  "harmonix-fold4",
  "harmonix-fold5",
  "harmonix-fold6",
  "harmonix-fold7",
] as const;
export const ANALYSIS_DEFAULT_MODEL = "harmonix-all";
export const ANALYSIS_DEFAULT_VISUALIZE = false;
export const ANALYSIS_DEFAULT_SONIFY = false;
export const ANALYSIS_DEFAULT_ACTIV = false;
export const ANALYSIS_DEFAULT_EMBED = false;
export const ANALYSIS_DEFAULT_INCLUDE_ACTIVATIONS = false;
export const ANALYSIS_DEFAULT_INCLUDE_EMBEDDINGS = false;

export const analysisSchema = z.object({
  music_input: z.url().describe("An audio file input to analyze."),
  visualize: z
    .boolean()
    .default(ANALYSIS_DEFAULT_VISUALIZE)
    .describe("Save track analysis' visualization"),
  sonify: z
    .boolean()
    .default(ANALYSIS_DEFAULT_SONIFY)
    .describe(
      "Save track analysis' sonification. This will include a mix of a click track with section callouts and the original audio",
    ),
  activ: z
    .boolean()
    .default(ANALYSIS_DEFAULT_ACTIV)
    .describe("Save frame-level raw activations from sigmoid and softmax"),
  embed: z.boolean().default(false).describe("Save frame-level embeddings"),
  model: z
    .enum(ANALYSIS_MODELS)
    .default(ANALYSIS_DEFAULT_MODEL)
    .describe("Name of the pretrained model to use"),
  include_activations: z
    .boolean()
    .default(ANALYSIS_DEFAULT_INCLUDE_ACTIVATIONS)
    .describe("Whether to include activations in the analysis results or not."),
  include_embeddings: z
    .boolean()
    .default(ANALYSIS_DEFAULT_INCLUDE_EMBEDDINGS)
    .describe("Whether to include embeddings in the analysis results or not"),
});

export type AnalysisSchema = z.infer<typeof analysisSchema>;

export const midiSchema = z.object({
  audio_file: z.url().describe("An audio file input to transcribe MIDI."),
});

export type MidiTranscription = z.infer<typeof midiSchema>;

export const LYRICS_TASKS = ["transcribe", "translate"] as const;
export const LYRICS_DEFAULT_TASK = "transcribe" as const;
export const LYRICS_LANGUAGES = [
  "None",
  "afrikaans",
  "albanian",
  "amharic",
  "arabic",
  "armenian",
  "assamese",
  "azerbaijani",
  "bashkir",
  "basque",
  "belarusian",
  "bengali",
  "bosnian",
  "breton",
  "bulgarian",
  "cantonese",
  "catalan",
  "chinese",
  "croatian",
  "czech",
  "danish",
  "dutch",
  "english",
  "estonian",
  "faroese",
  "finnish",
  "french",
  "galician",
  "georgian",
  "german",
  "greek",
  "gujarati",
  "haitian creole",
  "hausa",
  "hawaiian",
  "hebrew",
  "hindi",
  "hungarian",
  "icelandic",
  "indonesian",
  "italian",
  "japanese",
  "javanese",
  "kannada",
  "kazakh",
  "khmer",
  "korean",
  "lao",
  "latin",
  "latvian",
  "lingala",
  "lithuanian",
  "luxembourgish",
  "macedonian",
  "malagasy",
  "malay",
  "malayalam",
  "maltese",
  "maori",
  "marathi",
  "mongolian",
  "myanmar",
  "nepali",
  "norwegian",
  "nynorsk",
  "occitan",
  "pashto",
  "persian",
  "polish",
  "portuguese",
  "punjabi",
  "romanian",
  "russian",
  "sanskrit",
  "serbian",
  "shona",
  "sindhi",
  "sinhala",
  "slovak",
  "slovenian",
  "somali",
  "spanish",
  "sundanese",
  "swahili",
  "swedish",
  "tagalog",
  "tajik",
  "tamil",
  "tatar",
  "telugu",
  "thai",
  "tibetan",
  "turkish",
  "turkmen",
  "ukrainian",
  "urdu",
  "uzbek",
  "vietnamese",
  "welsh",
  "yiddish",
  "yoruba",
] as const;
export const LYRICS_DEFAULT_LANGUAGE = "None" as const;
export const LYRICS_MIN_BATCH_SIZE = 1 as const;
export const LYRICS_MAX_BATCH_SIZE = 64 as const;
export const LYRICS_DEFAULT_BATCH_SIZE = 24 as const;
export const LYRICS_TIMESTAMP_OPTIONS = ["chunk", "word"] as const;
export const LYRICS_DEFAULT_TIMESTAMP_OPTION = "chunk" as const;
export const LYRICS_DEFAULT_DIARISE_AUDIO = false as const;

export const lyricsSchema = z.object({
  audio: z.url().describe("Audio file to transcribe lyrics."),
  task: z
    .enum(LYRICS_TASKS)
    .default(LYRICS_DEFAULT_TASK)
    .describe("Task to perform: transcribe or translate to another language."),
  language: z
    .enum(LYRICS_LANGUAGES)
    .default(LYRICS_DEFAULT_LANGUAGE)
    .describe(
      "Language spoken in the audio, specify 'None' to perform language detection.",
    ),
  batch_size: z
    .int()
    .min(LYRICS_MIN_BATCH_SIZE)
    .max(LYRICS_MAX_BATCH_SIZE)
    .default(LYRICS_DEFAULT_BATCH_SIZE)
    .describe(
      "Number of parallel batches you want to compute. Reduce if you face OOMs.",
    ),
  timestamp: z
    .enum(LYRICS_TIMESTAMP_OPTIONS)
    .default(LYRICS_DEFAULT_TIMESTAMP_OPTION)
    .describe(
      "Whisper supports both chunked as well as word level timestamps.",
    ),
  diarise_audio: z
    .boolean()
    .optional()
    .default(LYRICS_DEFAULT_DIARISE_AUDIO)
    .describe(
      "Use Pyannote.audio to diarise the audio clips. You will need to provide hf_token below too.",
    ),
  hf_token: z
    .string()
    .optional()
    .describe(
      "Provide a hf.co/settings/token for Pyannote.audio to diarise the audio clips. You need to agree to the terms in 'https://huggingface.co/pyannote/speaker-diarization-3.1' and 'https://huggingface.co/pyannote/segmentation-3.0' first.",
    ),
});

export type LyricsSchema = z.infer<typeof lyricsSchema>;
