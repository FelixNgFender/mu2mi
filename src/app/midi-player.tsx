"use client";

import "./midi-player.css";
import {
  type BaseVisualizer,
  blobToNoteSequence,
  type INoteSequence,
  type NoteSequence,
  PianoRollSVGVisualizer,
  Player,
  SoundFontPlayer,
  urlToNoteSequence,
  WaterfallSVGVisualizer,
} from "@magenta/music/es6";
import { ChevronLeftCircle, Loader2, Pause, Play } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type MidiPlayerProps<T extends string = string> = {
  initialURL?: string;
  callback?: Route<T> | URL;
  isPublic?: boolean;
};

export default function MidiPlayer<T extends string = string>({
  initialURL,
  callback,
  isPublic = false,
}: MidiPlayerProps<T>) {
  const playerRef = useRef<SoundFontPlayer | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const waterfallRef = useRef<HTMLDivElement | null>(null);

  const [soundfont, setSoundfont] = useState<string>(
    "https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus",
  );
  const [visualizers, setVisualizers] = useState<BaseVisualizer[]>([]);
  const [currentSequence, setCurrentSequence] = useState<INoteSequence>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [midiUrl, setMidiUrl] = useState<string | null>(initialURL ?? null);
  const [tempo, setTempo] = useState(100);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current = null;
    }

    playerRef.current = new SoundFontPlayer(
      soundfont,
      Player.tone.Master,
      undefined,
      undefined,
      {
        run: (note: NoteSequence.Note) => {
          for (let i = 0; i < visualizers.length; i++) {
            visualizers[i].redraw(note, true);
          }
        },
        stop: () => {
          for (let i = 0; i < visualizers.length; i++) {
            visualizers[i].clearActiveNotes();
          }
        },
      },
    );

    // on first load, if there's a midi URL, load it

    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current = null;
      }
    };
  }, [visualizers, soundfont]);

  const initPlayerAndVisualizers = useCallback(async (seq: INoteSequence) => {
    if (
      !playerRef.current ||
      !svgRef.current ||
      !waterfallRef.current ||
      !seq.tempos ||
      !seq.tempos[0] ||
      !seq.tempos[0].qpm
    ) {
      return;
    }

    if (!seq.notes || seq.notes.length === 0) {
      toast.error("Invalid or empty MIDI file.");
      return;
    }

    setIsLoading(true);
    setCurrentSequence(seq);
    setVisualizers([
      new PianoRollSVGVisualizer(seq, svgRef.current),
      new WaterfallSVGVisualizer(seq, waterfallRef.current),
    ]);

    const newTempo = seq.tempos[0].qpm;
    playerRef.current.setTempo(newTempo);
    setTempo(newTempo);

    await playerRef.current.loadSamples(seq);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const loadInitialUrl = async () => {
      if (midiUrl) {
        try {
          const ns = await urlToNoteSequence(midiUrl);
          await initPlayerAndVisualizers(ns);
        } catch (error) {
          toast.error("Uh oh! Something went wrong.", {
            description: (error as Error).message || "",
          });
        }
      }
    };
    loadInitialUrl();
  }, [midiUrl, initPlayerAndVisualizers]);

  const handlePlay = () => {
    if (!playerRef.current || !currentSequence) {
      return;
    }
    if (playerRef.current.isPlaying()) {
      playerRef.current.stop();
      setIsPlaying(false);
    } else {
      playerRef.current.start(currentSequence);
      setIsPlaying(true);
    }
  };

  return (
    <section className="flex h-full flex-col items-center gap-4 pb-4">
      <ScrollArea className="w-full whitespace-nowrap rounded-md border px-2 py-4 sm:border-0">
        <div className="my-1 flex w-full justify-between gap-2">
          {callback && (
            <Link
              href={callback as Route}
              className={cn(
                buttonVariants({ variant: "link" }),
                "my-auto self-start",
              )}
            >
              <span>
                <ChevronLeftCircle className="mr-2 h-4 w-4" />
              </span>
              <span>Back to tracks</span>
            </Link>
          )}
          <div className="flex flex-1 items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <Label>
                {isLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
              </Label>
              <Button
                type="button"
                title={isLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
                disabled={isLoading}
                variant="secondary"
                size="icon"
                onClick={handlePlay}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
                </span>
              </Button>
            </div>
            <div className="gap-1">
              <Label htmlFor="soundfont">Choose a SoundFont</Label>
              <Select
                onValueChange={(value) => setSoundfont(value)}
                defaultValue={soundfont || undefined}
                disabled={isPlaying}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="SoundFont" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus">
                    Multi-instrument (SGM Plus)
                  </SelectItem>
                  <SelectItem value="https://storage.googleapis.com/magentadata/js/soundfonts/salamander">
                    Piano (Salamander Grand Piano)
                  </SelectItem>
                  <SelectItem value="https://storage.googleapis.com/magentadata/js/soundfonts/jazz_kit">
                    Percussion (Jazz Kit EXS)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-32 gap-2">
              <Label htmlFor="tempoInput" className="truncate">
                Tempo: {tempo} BPM
              </Label>
              <Slider
                id="tempoInput"
                disabled={isPlaying}
                min={20}
                max={240}
                step={1}
                value={[tempo]}
                onValueChange={(e) => {
                  if (!e[0]) {
                    return;
                  }
                  playerRef.current?.setTempo(e[0]);
                  setTempo(e[0]);
                }}
              />
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {!callback && !isPublic && (
        <>
          <Dropzone
            classNameWrapper="w-full flex-1 max-h-64"
            className="h-full w-full"
            name="midi"
            disabled={isPlaying}
            aria-disabled={isPlaying}
            accept="audio/midi"
            dropMessage={file ? file.name : "Drop like it's hot 🔥"}
            handleOnDrop={async (acceptedFiles: FileList | null) => {
              if (!acceptedFiles || !acceptedFiles[0]) {
                return;
              }
              setFile(acceptedFiles[0]);
              try {
                const ns = await blobToNoteSequence(acceptedFiles[0]);
                await initPlayerAndVisualizers(ns);
              } catch (error) {
                toast.error("Uh oh! Something went wrong.", {
                  description: (error as Error).message || "",
                });
              }
            }}
          />
          <Input
            type="url"
            name="midiUrl"
            disabled={isPlaying}
            value={midiUrl || ""}
            placeholder="Enter a MIDI URL"
            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
              try {
                setMidiUrl(e.target.value);
                const ns = await urlToNoteSequence(e.target.value);
                await initPlayerAndVisualizers(ns);
              } catch (error) {
                toast.error("Uh oh! Something went wrong.", {
                  description: (error as Error).message || "",
                });
              }
            }}
          />
        </>
      )}
      <Card className="w-full flex-1">
        <CardContent className="flex h-full flex-col items-center justify-around gap-8">
          {!currentSequence && (
            <p className="text-center text-sm text-muted-foreground">
              Drop a MIDI file or enter a URL to get started
            </p>
          )}
          <svg
            id="svg"
            ref={svgRef}
            className={currentSequence ? "" : "hidden"}
          />
          <div
            id="waterfall"
            ref={waterfallRef}
            className={currentSequence ? "" : "hidden"}
          />
        </CardContent>
      </Card>
    </section>
  );
}
