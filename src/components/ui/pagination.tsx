import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

const Pagination = ({
  className,
  ...props
}: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & React.ComponentProps<"button">

const PaginationLink = ({
  className,
  isActive,
  ...props
}: PaginationLinkProps) => (
  <button
    type="button"
    className={cn(
      "inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-transparent px-3 text-sm font-medium transition hover:border-neutral-200 hover:bg-neutral-50",
      isActive
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "text-neutral-600",
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<"button">) => (
  <button
    type="button"
    className={cn(
      "inline-flex h-9 items-center gap-1 rounded-full border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-60",
      className
    )}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Anterior</span>
  </button>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<"button">) => (
  <button
    type="button"
    className={cn(
      "inline-flex h-9 items-center gap-1 rounded-full border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-60",
      className
    )}
    {...props}
  >
    <span>Próxima</span>
    <ChevronRight className="h-4 w-4" />
  </button>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
