"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isDefinedError } from "@orpc/client";
import { useMutation } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import JSZip from "jszip";
import {
  ArrowUpDown,
  CheckCircle,
  Copy,
  Download,
  Globe,
  GlobeLock,
  Loader2,
  Pencil,
  Save,
  Share2,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config";
import { umami } from "@/lib/analytics";
import { browserClient } from "@/lib/rpc";
import { cn } from "@/lib/utils";
import type { UserTrack } from "@/model/track";
import type { TrackStatus } from "@/types/db/schema";
import { type EditTrackFormType, editTrackFormSchema } from "../schema";

function getStatusIndicator(status: TrackStatus) {
  switch (status) {
    case "processing":
      return <Loader2 className="inline h-4 w-4 animate-spin" />;
    case "succeeded":
      return <CheckCircle className="inline h-4 w-4" />;
    case "failed":
      return <XCircle className="inline h-4 w-4" />;
    case "canceled":
      return <Trash2 className="inline h-4 w-4" />;
  }
}

function DownloadButton({ track }: { track: UserTrack }) {
  const mutation = useMutation(
    browserClient.asset.downloadUserTrackAssets.mutationOptions({
      onSuccess: async (data) => {
        const zip = new JSZip();
        const promises = data.map((asset) =>
          fetch(asset.url)
            .then((response) => response.blob())
            .then((blob) => {
              const filename = `${asset.type || `track${Date.now()}`}.${blob.type.split("/")[1]}`;
              zip.file(filename, blob);
            }),
        );
        await Promise.all(promises);
        const archive = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(archive);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${track.type}_${track.id}_assets.zip`;
        a.click();
        URL.revokeObjectURL(url);
      },
      onError(error) {
        toast.error("Uh oh! Something went wrong.", {
          description: error.message || "",
        });
        return;
      },
    }),
  );

  function handleDownload() {
    mutation.mutate({
      id: track.id,
    });
  }

  return (
    <Button
      title="Download track"
      variant="outline"
      disabled={mutation.isPending}
      size="icon"
      onClick={handleDownload}
      data-umami-event={umami.downloadTrack.name}
    >
      {mutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="sr-only">
        {mutation.isPending ? "Downloading..." : "Download track"}
      </span>
    </Button>
  );
}

function EditButton({ track }: { track: UserTrack }) {
  type FieldName = keyof EditTrackFormType;
  const form = useForm<EditTrackFormType>({
    resolver: zodResolver(editTrackFormSchema),
    defaultValues: {
      name: track.name,
      public: track.public,
    },
  });

  const mutation = useMutation(
    browserClient.track.updateUserTrack.mutationOptions({
      onError(error) {
        if (isDefinedError(error) && error.code === "INPUT_VALIDATION_FAILED") {
          for (const [path, value] of Object.entries(error.data.fieldErrors)) {
            form.setError(path as FieldName, {
              type: path,
              message: value?.join(", "),
            });
          }
          return;
        }
        toast.error("Uh oh! something went wrong.", {
          description: error.message,
        });
      },
    }),
  );

  function onEditSave(data: EditTrackFormType) {
    mutation.mutate({
      trackId: track.id,
      name: data.name,
      public: data.public,
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" title="Edit track" variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit track</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit track details</DialogTitle>
          <DialogDescription>
            Make changes to your track details. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="edit-track" onSubmit={form.handleSubmit(onEditSave)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Name</FormLabel>
                    <FormControl>
                      <Input
                        className="col-span-3"
                        {...field}
                        disabled={form.formState.isSubmitting}
                        aria-disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="public"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Public?</FormLabel>
                    <Checkbox
                      className="col-span-3"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                      aria-disabled={form.formState.isSubmitting}
                    />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="mt-2"
              disabled={form.formState.isSubmitting}
              aria-disabled={form.formState.isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </DialogClose>
          <Button
            title={form.formState.isSubmitting ? "Saving..." : "Save"}
            className="mt-2"
            type="submit"
            form="edit-track"
            disabled={form.formState.isSubmitting}
            aria-disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShareButton({ track }: { track: UserTrack }) {
  const mutation = useMutation(
    browserClient.track.updateUserTrack.mutationOptions({
      onSuccess() {
        toast(`${track.name} is now ${track.public ? "private" : "public"}!`);
      },
      onError(error) {
        toast.error("Uh oh! something went wrong.", {
          description: error.message,
        });
      },
    }),
  );

  function getTrackPublicLink() {
    if (typeof window === "undefined") {
      return "";
    }
    if (track.type === "midi") {
      return `${window.location.origin}${siteConfig.paths.preview.midi.template}/${track.id}`;
    } else if (track.type === "lyrics") {
      return `${window.location.origin}${siteConfig.paths.preview.karaoke.template}/${track.id}`;
    }
    return `${window.location.origin}${siteConfig.paths.preview.track.template}/${track.id}`;
  }

  function handleShare() {
    mutation.mutate({ trackId: track.id, public: !track.public });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button title="Share track" variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share track</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share track</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view the track.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-6 pt-4">
            <p>
              Current visibility:{" "}
              <span className="font-bold">
                {track.public ? "Public" : "Private"}
              </span>
            </p>
            <Button
              title="Toggle visibility"
              variant="outline"
              disabled={mutation.isPending}
              onClick={handleShare}
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : track.public ? (
                <Globe className="mr-2 h-4 w-4" />
              ) : (
                <GlobeLock className="mr-2 h-4 w-4" />
              )}
              Make {track.public ? "private" : "public"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Track public link
              </Label>
              <Input
                id="link"
                defaultValue={getTrackPublicLink()}
                readOnly
                disabled={!track.public}
              />
            </div>
            <Button
              title="Copy link"
              type="submit"
              size="sm"
              className="px-3"
              disabled={!track.public}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(getTrackPublicLink());
                  toast("Link copied!");
                } catch (error) {
                  toast.error("Uh oh! Something went wrong.", {
                    description: (error as Error).message,
                  });
                }
              }}
              data-umami-event={umami.shareTrack.name}
            >
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteButton({ track }: { track: UserTrack }) {
  const mutation = useMutation(
    browserClient.track.deleteUserTrack.mutationOptions({
      onError(error) {
        toast.error("Uh oh! something went wrong.", {
          description: error.message,
        });
      },
    }),
  );

  function handleDelete() {
    mutation.mutate({ id: track.id });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete track</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm track deletion</DialogTitle>
          <DialogDescription>
            This irreversible action will delete the track and all related
            assets.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="mt-2">
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={handleDelete}
            data-umami-event={umami.deleteTrack.name}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete track
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function trackTableColumnsBuiler(
  basePreviewPath?: string,
  callback?: string,
) {
  const trackTableColumns: ColumnDef<UserTrack>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Track Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          {basePreviewPath ? (
            <Link
              href={
                (callback
                  ? `${basePreviewPath}/${row.original.id}?callback=${callback}`
                  : `${basePreviewPath}/${row.original.id}`) as Route
              }
              className={cn(
                buttonVariants({ variant: "link" }),
                "text-foreground",
              )}
            >
              {row.original.name}
            </Link>
          ) : (
            <span>{row.original.name}</span>
          )}
          {row.original.public && <Badge variant="secondary">Public</Badge>}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="whitespace-nowrap capitalize">
          <span className="mr-2">
            {getStatusIndicator(row.getValue("status"))}
          </span>
          {row.getValue("status")}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const track = row.original;

        return (
          <div className="flex justify-end gap-2">
            <DownloadButton track={track} />
            <EditButton track={track} />
            <ShareButton track={track} />
            <DeleteButton track={track} />
          </div>
        );
      },
    },
  ];
  return trackTableColumns;
}
