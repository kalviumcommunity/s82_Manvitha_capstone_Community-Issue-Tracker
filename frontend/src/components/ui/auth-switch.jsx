import { cn } from "@/lib/utils";
import { useState } from "react";

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 p-6 rounded-xl",
        "bg-[#121212] border border-[#292929] shadow-lg",
        "text-[#F5F2ED] transition-all duration-200 w-full max-w-xs"
      )}
    >
      <h1 className="text-2xl font-bold mb-2 text-[#F5F2ED] tracking-tight">
        Component Example
      </h1>
      <h2 className="text-3xl font-extrabold text-[#F5F2ED] font-mono">
        {count}
      </h2>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCount((prev) => prev - 1)}
          aria-label="Decrease count"
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1A1A1A] border border-[#292929] text-[#F5F2ED] hover:border-[#B87333] hover:text-[#C98545] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B87333] cursor-pointer"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => setCount((prev) => prev + 1)}
          aria-label="Increase count"
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#B87333] hover:bg-[#C98545] text-[#080808] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#B87333] cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
};

export const AuthSwitch = Component;
export default Component;
