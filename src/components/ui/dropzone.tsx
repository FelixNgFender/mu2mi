import React, { type ChangeEvent, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DropzoneProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  classNameWrapper?: string;
  className?: string;
  dropMessage: string;
  handleOnDrop: (acceptedFiles: FileList | null) => void;
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  (
    { className, classNameWrapper, dropMessage, handleOnDrop, ...props },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    // Function to handle drag over event
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handleOnDrop(null);
    };

    // Function to handle drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const { files } = e.dataTransfer;
      if (inputRef.current) {
        inputRef.current.files = files;
        handleOnDrop(files);
      }
    };

    // Function to simulate a click on the file input element
    const handleButtonClick = () => {
      if (inputRef.current) {
        inputRef.current.click();
      }
    };
    return (
      <Card
        ref={ref}
        className={cn(
          `border-2 border-dashed bg-muted`,
          classNameWrapper,
          props.disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:cursor-pointer hover:border-muted-foreground/50",
        )}
      >
        <CardContent
          className="flex h-full flex-col items-center justify-center gap-2 px-2 py-4 text-xs ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleButtonClick();
            }
          }}
          tabIndex={0}
          aria-label={dropMessage}
        >
          <div className="flex items-center justify-center text-muted-foreground">
            <label
              htmlFor="dropzone"
              className="text-sm font-medium md:text-base"
            >
              {dropMessage}
            </label>
            <Input
              {...props}
              value={undefined}
              id="dropzone"
              ref={inputRef}
              type="file"
              className={cn("hidden", className)}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleOnDrop(e.target.files)
              }
            />
          </div>
        </CardContent>
      </Card>
    );
  },
);

Dropzone.displayName = "Dropzone";

export { Dropzone };
