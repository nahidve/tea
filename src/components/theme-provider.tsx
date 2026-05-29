"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      {...props}
      enableSystem
      attribute="class"
      defaultTheme="dark"
    >
      {children}
    </NextThemesProvider>
  );
}
