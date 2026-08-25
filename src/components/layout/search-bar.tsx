"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, SearchIcon, Wrench, X } from "lucide-react";

import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { SearchResult, SiteSearchResults } from "@/features/search/services/site-search";

/**
 * Header search with type-ahead across products and services.
 *
 * Submitting always works without JavaScript having resolved anything — the
 * form posts to `/search`, so the suggestion list is an accelerator rather
 * than the only way through. That matters here: the drop-down shows the top
 * few hits, and pressing Enter has to reach the full result page.
 *
 * Requests are debounced and every in-flight one is abortable, so fast typing
 * can't land an old response on top of a newer one. Queries under two
 * characters are never sent — a single letter matches most of the catalogue.
 *
 * The listbox follows the combobox pattern: arrow keys move a virtual cursor
 * without stealing focus from the input, Enter opens the highlighted row (or
 * submits the raw query when nothing is highlighted), and Escape closes.
 */
const EMPTY: SiteSearchResults = { products: [], services: [], total: 0 };
const DEBOUNCE_MS = 200;
const MIN_CHARS = 2;

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const listboxId = useId();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SiteSearchResults>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flat list in render order, so the arrow keys can walk products into
  // services without caring which group a row belongs to.
  const flat: SearchResult[] = [...results.products, ...results.services];

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_CHARS) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : EMPTY))
        .then((data: SiteSearchResults) => {
          setResults(data);
          setCursor(-1);
          setLoading(false);
        })
        .catch(() => {
          // An abort is the expected outcome of typing another character, not
          // a failure worth surfacing.
          if (!controller.signal.aborted) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close when focus or a click leaves the whole control.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(href);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const highlighted = flat[cursor];
    if (highlighted) {
      go(highlighted.href);
      return;
    }

    const trimmed = query.trim();
    if (trimmed === "") return;

    setOpen(false);
    inputRef.current?.blur();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (flat.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setCursor((current) => {
        const next = event.key === "ArrowDown" ? current + 1 : current - 1;
        if (next < 0) return flat.length - 1;
        if (next >= flat.length) return 0;
        return next;
      });
    }
  };

  const showPanel = open && query.trim().length >= MIN_CHARS;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <form action="/search" role="search" onSubmit={submit}>
        <div className="flex h-9 items-center gap-2 rounded-full border bg-background px-3 transition-colors focus-within:border-primary">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />

          <label htmlFor={`${listboxId}-input`} className="sr-only">
            Search products and services
          </label>

          <input
            id={`${listboxId}-input`}
            ref={inputRef}
            name="q"
            type="search"
            autoComplete="off"
            value={query}
            placeholder="Search products & services…"
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={cursor >= 0 ? `${listboxId}-option-${cursor}` : undefined}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />

          {loading && (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
          )}

          {!loading && query !== "" && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border/60 bg-popover shadow-xl">
          {flat.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {loading ? "Searching…" : `No matches for “${query.trim()}”`}
            </p>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Search suggestions" className="max-h-96 overflow-y-auto py-2">
              <ResultGroup
                label="Products"
                items={results.products}
                offset={0}
                cursor={cursor}
                listboxId={listboxId}
                onPick={go}
                onHover={setCursor}
              />
              <ResultGroup
                label="Services"
                items={results.services}
                offset={results.products.length}
                cursor={cursor}
                listboxId={listboxId}
                onPick={go}
                onHover={setCursor}
              />
            </ul>
          )}

          {query.trim() !== "" && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              className="flex w-full items-center gap-2 border-t border-border/60 px-4 py-3 text-left text-sm font-medium text-primary transition-colors hover:bg-muted/60"
            >
              <SearchIcon className="size-4 shrink-0" aria-hidden="true" />
              See all results for “{query.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  label,
  items,
  offset,
  cursor,
  listboxId,
  onPick,
  onHover,
}: {
  label: string;
  items: SearchResult[];
  offset: number;
  cursor: number;
  listboxId: string;
  onPick: (href: string) => void;
  onHover: (index: number) => void;
}) {
  if (items.length === 0) return null;

  return (
    <>
      <li
        role="presentation"
        className="px-4 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </li>

      {items.map((item, index) => {
        const position = offset + index;
        const active = cursor === position;

        return (
          <li
            key={`${item.kind}-${item.id}`}
            id={`${listboxId}-option-${position}`}
            role="option"
            aria-selected={active}
            onMouseEnter={() => onHover(position)}
            // Pointer-down rather than click: the panel's outside-press handler
            // fires on pointerdown, and a click would arrive after it closed.
            onPointerDown={(event) => {
              event.preventDefault();
              onPick(item.href);
            }}
            className={cn(
              "flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors",
              active && "bg-muted/70",
            )}
          >
            <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt="" fill sizes="40px" className="object-cover" />
              ) : item.kind === "service" ? (
                <Wrench className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Icon name={item.icon} className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{item.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
            </span>
          </li>
        );
      })}
    </>
  );
}
