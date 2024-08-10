import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

// background-gradient.tsx
export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  return (
    <div className={cn("relative p-[1px] group", containerClassName)}>
      <motion.div
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl  transition duration-500",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
        )}
        animate={animate ? {
          backgroundPosition: ["0% 0%", "100% 100%"],
        } : undefined}
        transition={animate ? {
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        } : undefined}
      />
      <motion.div
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1]",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
        )}
        animate={animate ? {
          backgroundPosition: ["0% 0%", "100% 100%"],
        } : undefined}
        transition={animate ? {
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        } : undefined}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};