"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  campaignId: string;
  campaignName: string;
};

export function ShareCampaignDialog({ campaignId, campaignName }: Props) {
  const [copied, setCopied] = useState(false);

  // Bouw de absolute URL pas client-side; SSR weet de hostname niet.
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/c/${campaignId}`;
  }, [campaignId]);

  async function copy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link gekopieerd");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopiëren mislukt — selecteer en kopieer handmatig.");
    }
  }

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(
      `Je campagne van Next Level Sites — ${campaignName}`
    );
    const body = encodeURIComponent(
      `Hi,\n\nHierbij de complete campagne — landingspagina, advertenties, social en cinematic concept. Bekijk 'm hier:\n\n${shareUrl}\n\nLaat me weten wat je ervan vindt en welk deel we als eerste live zetten.\n\nGroet,\nMitchell\nNext Level Sites`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  }, [campaignName, shareUrl]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" data-testid="share-campaign">
          <Share2 className="size-4" />
          Deel met klant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl tracking-tight">
            Deel deze campagne
          </DialogTitle>
          <DialogDescription>
            Een schone klant-weergave — geen studio-techniek, alleen het werk.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Klant-link
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-xs text-text"
              />
              <Button variant="secondary" size="md" onClick={copy}>
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? "Gekopieerd" : "Kopieer"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-text-subtle">
              Iedereen met deze link kan de campagne bekijken — geen login
              nodig.
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <Button asChild variant="accent" className="w-full">
              <a href={mailto}>
                <Mail className="size-4" />
                Verstuur via mail
              </a>
            </Button>
            <p className="mt-2 text-center text-xs text-text-subtle">
              Opent je e-mail-app met onderwerp en bericht ingevuld.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
