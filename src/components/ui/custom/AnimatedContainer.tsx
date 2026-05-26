"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
}

export default function AnimatedContainer({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 6,
  duration = 0.2,
  ...props
}: AnimatedContainerProps) {
  const getOffset = () => {
    switch (direction) {
      case "up":    return { y: distance };
      case "down":  return { y: -distance };
      case "left":  return { x: distance };
      case "right": return { x: -distance };
      default:      return {};
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getOffset() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...getOffset() }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
