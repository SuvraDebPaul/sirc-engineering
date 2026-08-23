"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Tab shell for the lower half of the product page.
 *
 * Content arrives as `ReactNode` props rather than being built in here, so the
 * description, specification table and reviews all stay server components and
 * ship no JavaScript. Only the tab switching is client-side — which is the
 * only part that actually needs to be.
 *
 * `forceMount` keeps every panel in the document instead of letting Radix
 * unmount the inactive ones. It is all static text that was rendered on the
 * server anyway, and a specification table that only exists after a click is a
 * specification table a crawler never sees. `forceMount` also stops Radix
 * applying its own `hidden`, so the inactive panels are hidden here instead —
 * with `display: none`, which keeps them out of the accessibility tree and out
 * of the tab order rather than merely making them invisible.
 */
export interface ProductTab {
  value: string;
  label: string;
  content: React.ReactNode;
}

export function ProductTabs({
  tabs,
  defaultValue,
}: {
  tabs: ProductTab[];
  /** Overrides which tab starts active — e.g. a review-sort link should land back on "reviews". */
  defaultValue?: string;
}) {
  if (tabs.length === 0) return null;

  return (
    <Tabs defaultValue={defaultValue ?? tabs[0]!.value} className="w-full">
      <div className="border-b">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="relative rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} forceMount className="pt-8 data-[state=inactive]:hidden">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
