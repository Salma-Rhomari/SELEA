import { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hoverable?: boolean;
};

export default function Card({
  children,
  hoverable = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white border border-taupe/15 ${
        hoverable ? "transition-transform duration-200 hover:-translate-y-1" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}