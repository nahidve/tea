"use client";

import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import { motion } from "framer-motion";
import GradientButton from "./ui/custom/GradientButton";

function DesktopNavbar() {
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: HomeIcon },
    ...(isSignedIn
      ? [
          { href: "/notifications", label: "Notifications", icon: BellIcon },
          {
            href: `/profile/${
              user?.username ??
              user?.emailAddresses[0]?.emailAddress?.split("@")[0] ?? ""
            }`,
            label: "Profile",
            icon: UserIcon,
          },
        ]
      : []),
  ];

  return (
    <div className="hidden md:flex items-center space-x-3">
      <div className="flex items-center space-x-1 bg-secondary/35 p-0.5 rounded-md border border-border/40 backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors duration-150 hover:text-foreground ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-background/80 shadow-sm rounded-md border border-border/40"
                  transition={{ type: "spring", stiffness: 450, damping: 40 }}
                />
              )}
              <item.icon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center space-x-3">
        <ModeToggle />
        {isSignedIn ? (
          <div className="flex items-center scale-95 origin-right">
            <UserButton />
          </div>
        ) : (
          <SignInButton mode="modal">
            <GradientButton variant="primary" size="sm">
              Sign In
            </GradientButton>
          </SignInButton>
        )}
      </div>
    </div>
  );
}

export default DesktopNavbar;
