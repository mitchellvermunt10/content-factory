"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ExternalLink, Link2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_VIDEO_ACCEPT,
  ACCEPTED_IMAGE_ACCEPT,
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/constants";
import type {
  PipelineScene,
} from "@/lib/schemas/artifacts/videoProduction";

type LocalFile = NonNullable<
  PipelineScene["assets"]["videos"][number]["localFile"]
>;

const MAX_FILE_MB = 200;

function looksPlayableUrl(url: string | null): boolean {
  if (!url) return false;
  if (url.startsWith("blob:") || url.startsWith("data:")) return true;
  try {
    const u = new URL(url);
    if (/(^|\.)placeholder\./.test(u.hostname)) return false;
    return /^https?:$/.test(u.protocol);
  } catch {
    return false;
  }
}

export function AssetUploader({
  kind,
  url,
  localFile,
  onUrlChange,
  onLocalFileChange,
  onClear,
  testIdPrefix,
}: {
  kind: "video" | "image";
  url: string | null;
  localFile: LocalFile | null;
  onUrlChange: (url: string | null) => void;
  onLocalFileChange: (file: LocalFile | null) => void;
  onClear: () => void;
  testIdPrefix: string;
}) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Track blob lifetime — revoke on unmount or replacement.
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  // Cleanup stale persisted blob URLs after a reload (zustand persists localFile,
  // but its blobUrl dies with the session).
  const [staleNotified, setStaleNotified] = useState(false);
  useEffect(() => {
    if (!localFile) return;
    if (blobUrlRef.current === localFile.blobUrl) return;
    // Probe — for a fresh blob created in THIS session, blobUrlRef will have been
    // set by handleFile. If it's not, this localFile must be stale.
    if (!staleNotified) {
      setStaleNotified(true);
      onLocalFileChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accept = kind === "video" ? ACCEPTED_VIDEO_ACCEPT : ACCEPTED_IMAGE_ACCEPT;
  const acceptedTypes =
    kind === "video"
      ? (ACCEPTED_VIDEO_TYPES as readonly string[])
      : (ACCEPTED_IMAGE_TYPES as readonly string[]);
  const acceptLabel = kind === "video" ? "MP4 / MOV / WebM" : "PNG / JPG";

  function handleFile(file: File) {
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Bestandstype niet ondersteund", {
        description: `Verwacht: ${acceptLabel}. Kreeg: ${file.type || "onbekend"}.`,
      });
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error("Bestand te groot", {
        description: `Max ${MAX_FILE_MB} MB. Kreeg ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
      });
      return;
    }
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;
    onLocalFileChange({
      name: file.name,
      size: file.size,
      type: file.type,
      blobUrl,
    });
    toast.success("Bestand geladen", {
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`,
    });
  }

  function clearAll() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClear();
  }

  const previewUrl = localFile?.blobUrl ?? (looksPlayableUrl(url) ? url : null);
  const showPreview = !!previewUrl;

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-subtle" />
          <Input
            type="url"
            value={url ?? ""}
            onChange={(e) => onUrlChange(e.target.value || null)}
            placeholder="Plak Runway/Kling/Veo URL of CDN-link"
            className="pl-9 font-mono text-xs"
            data-testid={`${testIdPrefix}-url`}
          />
        </div>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          data-testid={`${testIdPrefix}-file-input`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          data-testid={`${testIdPrefix}-upload-button`}
        >
          <UploadCloud className="size-3.5" />
          Upload {kind === "video" ? "video" : "afbeelding"}
        </Button>
      </div>

      {localFile ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface/40 px-2.5 py-1.5 text-xs text-text-muted">
          <UploadCloud className="size-3 text-accent" />
          <span className="min-w-0 flex-1 truncate font-mono">
            {localFile.name}
          </span>
          <span className="font-mono text-[10px] text-text-subtle">
            {(localFile.size / 1024 / 1024).toFixed(1)} MB
          </span>
          <button
            type="button"
            onClick={clearAll}
            className="text-text-subtle hover:text-danger"
            aria-label="Verwijder upload"
            data-testid={`${testIdPrefix}-clear`}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ) : null}

      {showPreview ? (
        <div
          className={cn(
            "overflow-hidden rounded-lg border border-border bg-bg/40",
            kind === "image" ? "p-2" : ""
          )}
        >
          {kind === "video" ? (
            <video
              src={previewUrl ?? undefined}
              controls
              preload="metadata"
              className="aspect-video w-full bg-black"
              data-testid={`${testIdPrefix}-preview-video`}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl ?? ""}
              alt="Asset preview"
              className="mx-auto block max-h-44 rounded object-contain"
              data-testid={`${testIdPrefix}-preview-image`}
            />
          )}
        </div>
      ) : url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text"
        >
          <ExternalLink className="size-3" />
          Open URL in nieuw tabblad
        </a>
      ) : null}
    </div>
  );
}
