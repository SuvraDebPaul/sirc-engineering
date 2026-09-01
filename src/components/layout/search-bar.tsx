"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, SearchIcon, Sparkles, Wrench, X } from "lucide-react";

import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { SearchResult, SiteSearchResults } from "@/features/search/services/site-search";

const EMPTY: SiteSearchResults = { products: [], services: [], total: 0 };
const DEBOUNCE_MS = 200;
const MIN_CHARS = 2;

const POPULAR_SEARCHES = [
  { label: "Fluke Multimeters", query: "Fluke" },
  { label: "Insulation Testers", query: "Insulation" },
  { label: "Thermal Imagers", query: "Thermal" },
  { label: "Calibration Services", query: "Calibration" },
  { label: "Power Quality", query: "Power" },
];

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const listboxId = useId();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SiteSearchResults>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [isMac] = useState(() => typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent));

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut (Cmd+K / Ctrl+K / slash) to focus search
  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      const isInput =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement?.getAttribute("contenteditable") === "true";

      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !isInput)) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, []);

  // Flat list in render order, so the arrow keys can walk products into services
  const flat: SearchResult[] = [...results.products, ...results.services];

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_CHARS) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : EMPTY))
        .then((data: SiteSearchResults) => {
          setResults(data);
          setCursor(-1);
          setLoading(false);
        })
        .catch(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close when focus or a click leaves the whole control
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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
      inputRef.current?.blur();
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

  const trimmedQuery = query.trim();
  const showResults = open && trimmedQuery.length >= MIN_CHARS;
  const showSuggestions = open && trimmedQuery.length < MIN_CHARS;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <form action="/search" role="search" onSubmit={submit}>
        <div className="group relative flex h-10 items-center gap-2.5 rounded-full border border-border/80 bg-background/90 px-3.5 shadow-xs transition-all duration-200 hover:border-primary/40 focus-within:border-primary focus-within:bg-background focus-within:ring-3 focus-within:ring-primary/10">
          <SearchIcon
            className="size-4 shrink-0 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary"
            aria-hidden="true"
          />

          <label htmlFor={`${listboxId}-input`} className="sr-only">
            Search products, models and calibration services
          </label>

          <input
            id={`${listboxId}-input`}
            ref={inputRef}
            name="q"
            type="search"
            autoComplete="off"
            value={query}
            placeholder="Search instruments, models (e.g. Fluke 87V, MIT525)..."
            onChange={(event) => {
              const val = event.target.value;
              setQuery(val);
              if (val.trim().length < MIN_CHARS) {
                setResults(EMPTY);
              }
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={showResults || showSuggestions}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={cursor >= 0 ? `${listboxId}-option-${cursor}` : undefined}
            className="h-full min-w-0 flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground/75 [&::-webkit-search-cancel-button]:hidden"
          />

          {loading && (
            <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
          )}

          {!loading && query !== "" && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(EMPTY);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}

          {!loading && query === "" && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground shadow-2xs select-none">
              {isMac ? "⌘" : "Ctrl+"}K
            </kbd>
          )}
        </div>
      </form>

      {/* Suggestion / Results Popover */}
      {(showResults || showSuggestions) && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border/80 bg-popover/98 shadow-2xl shadow-black/12 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150">
          {showSuggestions && (
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                <Sparkles className="size-3.5 text-amber-500" aria-hidden="true" />
                Popular searches
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setQuery(item.query);
                      inputRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    <SearchIcon className="size-3 text-muted-foreground" aria-hidden="true" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showResults && (
            <>
              {flat.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {loading ? "Searching catalog & services…" : `No direct matches for “${trimmedQuery}”`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try searching by brand name (e.g. Fluke, Megger) or category.
                  </p>
                </div>
              ) : (
                <ul
                  id={listboxId}
                  role="listbox"
                  aria-label="Search suggestions"
                  data-lenis-prevent
                  className="max-h-[22rem] overflow-y-auto py-2"
                >
                  <ResultGroup
                    label="Instruments & Products"
                    count={results.products.length}
                    items={results.products}
                    offset={0}
                    cursor={cursor}
                    listboxId={listboxId}
                    onPick={go}
                    onHover={setCursor}
                  />
                  <ResultGroup
                    label="Laboratory & Calibration Services"
                    count={results.services.length}
                    items={results.services}
                    offset={results.products.length}
                    cursor={cursor}
                    listboxId={listboxId}
                    onPick={go}
                    onHover={setCursor}
                  />
                </ul>
              )}

              {trimmedQuery !== "" && (
                <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    <SearchIcon className="size-3.5 shrink-0" aria-hidden="true" />
                    See all results for “{trimmedQuery}”
                    <ArrowRight className="size-3 shrink-0" aria-hidden="true" />
                  </button>

                  <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <kbd className="rounded border border-border/80 bg-background px-1 py-0.5 text-[10px] font-mono">↑↓</kbd> Navigate
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <kbd className="rounded border border-border/80 bg-background px-1 py-0.5 text-[10px] font-mono">↵</kbd> Open
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <kbd className="rounded border border-border/80 bg-background px-1 py-0.5 text-[10px] font-mono">ESC</kbd> Close
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  label,
  count,
  items,
  offset,
  cursor,
  listboxId,
  onPick,
  onHover,
}: {
  label: string;
  count: number;
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
        className="flex items-center justify-between px-4 pt-2.5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
      >
        <span>{label}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
          {count}
        </span>
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
            onPointerDown={(event) => {
              event.preventDefault();
              onPick(item.href);
            }}
            className={cn(
              "group/item flex cursor-pointer items-center gap-3 px-4 py-2 transition-all duration-150",
              active ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
            )}
          >
            <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border/60 bg-muted">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt="" fill sizes="40px" className="object-cover" />
              ) : item.kind === "service" ? (
                <Wrench className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Icon name={item.icon} className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn("truncate text-sm font-medium", active ? "text-primary font-semibold" : "text-foreground")}>
                  {item.title}
                </span>
                {item.kind === "service" && (
                  <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Lab Service
                  </span>
                )}
              </div>
              <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
            </div>

            <ArrowRight
              className={cn(
                "size-4 shrink-0 transition-transform duration-200",
                active ? "translate-x-0 opacity-100 text-primary" : "-translate-x-1 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 text-muted-foreground",
              )}
              aria-hidden="true"
            />
          </li>
        );
      })}
    </>
  );
}
