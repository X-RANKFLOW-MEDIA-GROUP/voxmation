import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}: PaginationControlsProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-6 border-t border-border">
      {/* Items per page */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-silver/70">Items per page:</label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
          className="px-3 py-1 bg-primary/5 border border-primary/20 rounded text-silver-bright text-sm"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>

      {/* Pagination info */}
      <div className="text-sm text-silver/80">
        Showing {startItem} to {endItem} of {totalItems} applications
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2">
        <Button
          variant="neon-outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            if (pageNum > 0 && pageNum <= totalPages) {
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "neon" : "neon-outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            }
            return null;
          })}
        </div>

        <Button
          variant="neon-outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
