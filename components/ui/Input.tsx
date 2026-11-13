"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

type BaseProps = {
  label?: string;
  hint?: string;
  error?: string;
};

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: BaseProps & { htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label className="text-sm font-medium" htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

function Input({
  label,
  hint,
  error,
  className = "",
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <input
        id={id}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          error && "border-destructive",
          className
        )}
        {...rest}
      />
    </Field>
  )
}

function Textarea({
  label,
  hint,
  error,
  className = "",
  ...rest
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <textarea
        id={id}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          error && "border-destructive",
          className
        )}
        {...rest}
      />
    </Field>
  )
}

function Select({
  label,
  hint,
  error,
  className = "",
  children,
  ...rest
}: BaseProps & React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <select
        id={id}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          error && "border-destructive",
          className
        )}
        {...rest}
      >
        {children}
      </select>
    </Field>
  )
}

export { Field, Input, Textarea, Select }
export default Input
