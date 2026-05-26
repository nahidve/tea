"use client";

import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth, useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";
import GradientButton from "./ui/custom/GradientButton";

function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const profileUsername =
    user?.username ?? user?.emailAddresses[0]?.emailAddress?.split("@")[0] ?? "";

  return (
    <div className="flex md:hidden items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-md border border-border/40 bg-secondary/20 hover:bg-secondary/40 h-9 w-9 cursor-pointer"
      >
        <SunIcon className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
        <MoonIcon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-md border border-border/40 bg-secondary/20 hover:bg-secondary/40 h-9 w-9 cursor-pointer"
          >
            <MenuIcon className="h-4.5 w-4.5 text-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] glass-panel border-l border-border/45">
          <SheetHeader className="pb-4 border-b border-border/40">
            <SheetTitle className="text-left font-mono tracking-wider text-gradient">Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-3 mt-6">
            <Button
              variant="ghost"
              className="flex items-center gap-3 justify-start rounded-md hover:bg-secondary/60 text-sm font-semibold transition-all cursor-pointer"
              onClick={() => setShowMobileMenu(false)}
              asChild
            >
              <Link href="/">
                <HomeIcon className="w-4 h-4 text-muted-foreground" />
                Home
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 justify-start rounded-md hover:bg-secondary/60 text-sm font-semibold transition-all cursor-pointer"
                  onClick={() => setShowMobileMenu(false)}
                  asChild
                >
                  <Link href="/notifications">
                    <BellIcon className="w-4 h-4 text-muted-foreground" />
                    Notifications
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 justify-start rounded-md hover:bg-secondary/60 text-sm font-semibold transition-all cursor-pointer"
                  onClick={() => setShowMobileMenu(false)}
                  asChild
                >
                  <Link href={`/profile/${profileUsername}`}>
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    Profile
                  </Link>
                </Button>
                <div className="pt-4 border-t border-border/30">
                  <SignOutButton>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 justify-start w-full rounded-md hover:bg-destructive/10 hover:text-destructive text-sm font-semibold transition-all text-muted-foreground cursor-pointer"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      Logout
                    </Button>
                  </SignOutButton>
                </div>
              </>
            ) : (
              <div className="pt-2">
                <SignInButton mode="modal">
                  <GradientButton
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign In
                  </GradientButton>
                </SignInButton>
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;
