import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs uppercase tracking-wide text-taupe mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full bg-transparent border-b border-taupe/40 py-2 text-ink outline-none transition-colors focus:border-ink placeholder:text-taupe/60 ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;