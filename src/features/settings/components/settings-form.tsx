"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";

import { updateSiteSettings } from "@/features/settings/actions/update-settings";
import { emptySettingsState, type SiteSettingsData, type SocialLink } from "@/features/settings/types/settings";
import { SOCIAL_ICON_NAMES } from "@/components/shared/social-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * The one form that edits everything this site used to hardcode: identity,
 * logo, contact details and social links. Submits through a single Server
 * Action — `updateSiteSettings` — the same plain-FormData shape as every
 * other form in the app, with the file input as the one exception a browser
 * requires for uploads.
 *
 * Social links are the one genuinely dynamic list here, so they get local
 * state for add/remove/edit and are serialised into a hidden field on every
 * render — the same technique `checkout-form.tsx` uses for the cart summary.
 */
export function SettingsForm({ settings }: { settings: SiteSettingsData }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettings, emptySettingsState);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(settings.socialLinks);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);

  const addLink = () =>
    setSocialLinks((links) => [...links, { label: "", href: "", icon: SOCIAL_ICON_NAMES[0] }]);

  const removeLink = (index: number) =>
    setSocialLinks((links) => links.filter((_, i) => i !== index));

  const updateLink = (index: number, patch: Partial<SocialLink>) =>
    setSocialLinks((links) => links.map((link, i) => (i === index ? { ...link, ...patch } : link)));

  return (
    <form action={formAction} className="max-w-2xl space-y-10">
      {state.status === "success" && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-600"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          Settings saved.
        </div>
      )}

      {state.errors.form && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {state.errors.form}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-semibold tracking-tight">Site identity</h2>

        <FormField name="name" label="Site name" required error={state.errors.name}>
          {(props) => <Input {...props} defaultValue={settings.name} />}
        </FormField>

        <FormField
          name="shortDescription"
          label="Short description"
          required
          error={state.errors.shortDescription}
          hint="Shown in browser tabs and search results."
        >
          {(props) => <Input {...props} defaultValue={settings.shortDescription} />}
        </FormField>

        <FormField
          name="description"
          label="Description"
          required
          error={state.errors.description}
          hint="Used for search engines and social share previews."
        >
          {(props) => <Textarea {...props} rows={3} defaultValue={settings.description} />}
        </FormField>

        <div className="space-y-2">
          <Label htmlFor="logo">Logo</Label>
          <div className="flex items-center gap-4">
            {logoPreview && (
              <Image
                src={logoPreview}
                alt="Current logo"
                width={140}
                height={56}
                unoptimized
                className="h-14 w-auto rounded-md border bg-card object-contain p-1.5"
              />
            )}
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setLogoPreview(URL.createObjectURL(file));
              }}
              className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
          </div>
          <p className="text-xs text-muted-foreground">Leave empty to keep the current logo.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold tracking-tight">Contact details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="phone" label="Phone" required error={state.errors.phone}>
            {(props) => <Input {...props} type="tel" defaultValue={settings.phone} />}
          </FormField>

          <FormField
            name="whatsapp"
            label="WhatsApp number"
            required
            error={state.errors.whatsapp}
            hint="Digits only, international format (e.g. 8801XXXXXXXXX)."
          >
            {(props) => <Input {...props} defaultValue={settings.whatsapp} />}
          </FormField>

          <FormField name="email" label="Email" required error={state.errors.email}>
            {(props) => <Input {...props} type="email" defaultValue={settings.email} />}
          </FormField>

          <FormField name="hours" label="Business hours" required error={state.errors.hours}>
            {(props) => <Input {...props} defaultValue={settings.hours} />}
          </FormField>
        </div>

        <FormField name="address" label="Address" required error={state.errors.address}>
          {(props) => <Input {...props} defaultValue={settings.address} />}
        </FormField>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">Social links</h2>
          <Button type="button" variant="outline" size="sm" onClick={addLink}>
            <Plus className="size-4" aria-hidden="true" />
            Add link
          </Button>
        </div>

        {socialLinks.length === 0 && (
          <p className="text-sm text-muted-foreground">No social links yet.</p>
        )}

        <div className="space-y-3">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
              <Select value={link.icon} onValueChange={(value) => updateLink(index, { icon: value })}>
                <SelectTrigger className="w-[130px]" aria-label="Icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_ICON_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                aria-label="Label"
                placeholder="Label"
                value={link.label}
                onChange={(event) => updateLink(index, { label: event.target.value })}
                className="w-32"
              />

              <Input
                aria-label="URL"
                placeholder="https://…"
                value={link.href}
                onChange={(event) => updateLink(index, { href: event.target.value })}
                className="min-w-[180px] flex-1"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLink(index)}
                aria-label={`Remove ${link.label || "link"}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>

        <input type="hidden" name="socialLinks" value={JSON.stringify(socialLinks)} />
      </section>

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {isPending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
