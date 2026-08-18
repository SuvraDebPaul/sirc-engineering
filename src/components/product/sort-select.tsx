"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, type SortValue } from "@/lib/product";

/**
 * Writes the choice to the URL so sorting is shareable, back-button friendly,
 * and handled by the server query rather than re-sorting on the client.
 */
export const SortSelect = ({ value }: { value: SortValue }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", next);
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `?${query}` : "?", { scroll: false });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-muted-foreground sm:inline">
        Sort by:
      </span>
      <Select value={value} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger
          className="h-10 w-[170px] rounded-lg"
          aria-label="Sort products"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
