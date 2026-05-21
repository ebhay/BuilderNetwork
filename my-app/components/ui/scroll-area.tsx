import * as React from "react";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional className to apply custom styles.
   */
  className?: string;
}

/**
 * Simple ScrollArea component wrapping children in a div with vertical overflow.
 * Mirrors the API of shadcn/ui's ScrollArea for MVP usage.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`h-full overflow-y-auto ${className ?? ""}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";
