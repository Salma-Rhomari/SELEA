import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

const base =
  "inline-flex items-center justify-center text-sm uppercase tracking-wide transition-colors duration-200 px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-ink text-ivory hover:bg-taupe",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-ivory",
  ghost: "text-ink underline underline-offset-4 hover:text-taupe px-0 py-0",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}