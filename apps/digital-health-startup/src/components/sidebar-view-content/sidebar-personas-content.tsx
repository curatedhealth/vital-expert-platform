import Link from "next/link";
import { Users } from "lucide-react";

import { cn } from "@/shared/services/utils";
import { buttonVariants } from "@vital/ui";

export function SidebarPersonasContent() {
  return (
    <nav className="flex flex-col items-start gap-2">
      <Link
        href="/personas"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full justify-start gap-2"
        )}
      >
        <Users className="h-4 w-4" />
        Personas
      </Link>
    </nav>
  );
}