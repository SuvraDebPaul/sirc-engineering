"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { AdminNavLinks } from "@/features/admin/components/admin-nav-links";
import Logo from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminMobileSidebar({ logoUrl }: { logoUrl?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="size-4" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border">
          <SheetTitle className="text-left">
            <Logo url="/admin" src={logoUrl} className="h-9 w-auto" />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <AdminNavLinks onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
