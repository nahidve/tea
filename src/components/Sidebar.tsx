import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { getUserByClerkId } from "@/actions/user.action";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { LinkIcon, MapPinIcon } from "lucide-react";
import GlassPanel from "./ui/custom/GlassPanel";
import StatCard from "./ui/custom/StatCard";
import GradientButton from "./ui/custom/GradientButton";
import AnimatedContainer from "./ui/custom/AnimatedContainer";

async function Sidebar() {
  const authUser = await currentUser();
  if (!authUser) return <UnAuthenticatedSidebar />;

  const user = await getUserByClerkId(authUser.id);
  if (!user) return null;

  return (
    <div className="sticky top-20">
      <AnimatedContainer direction="up" delay={0.05}>
        <GlassPanel hoverable className="flex flex-col items-center text-center p-4">
          <Link
            href={`/profile/${user.username}`}
            className="flex flex-col items-center justify-center group"
          >
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-primary/10 to-primary/30 group-hover:from-primary/20 group-hover:to-primary/40 transition-all duration-300">
              <Avatar className="w-20 h-20 border-2 border-background shadow-md">
                <AvatarImage src={user.image || "/avatar.png"} />
              </Avatar>
            </div>

            <div className="mt-3 space-y-0.5">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {user.name}
              </h3>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </Link>

          {user.bio && (
            <p className="mt-2.5 text-xs text-muted-foreground/90 line-clamp-2 italic px-2">
              "{user.bio}"
            </p>
          )}

          <div className="w-full mt-3.5">
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/profile/${user.username}`}>
                <StatCard value={user._count.following} label="Following" />
              </Link>
              <Link href={`/profile/${user.username}`}>
                <StatCard value={user._count.followers} label="Followers" />
              </Link>
            </div>
          </div>

          <Separator className="w-full my-3 bg-border/40" />

          <div className="w-full space-y-2 text-xs">
            <div className="flex items-center text-muted-foreground/80 hover:text-foreground transition-colors">
              <MapPinIcon className="w-3.5 h-3.5 mr-2 text-muted-foreground/60" />
              {user.location || "No location"}
            </div>
            <div className="flex items-center text-muted-foreground/80 hover:text-foreground transition-colors">
              <LinkIcon className="w-3.5 h-3.5 mr-2 shrink-0 text-muted-foreground/60" />
              {user.website ? (
                <a
                  href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                  className="hover:underline truncate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.website}
                </a>
              ) : (
                "No website"
              )}
            </div>
          </div>
        </GlassPanel>
      </AnimatedContainer>
    </div>
  );
}

export default Sidebar;

const UnAuthenticatedSidebar = () => (
  <div className="sticky top-20">
    <AnimatedContainer direction="up" delay={0.05}>
      <GlassPanel className="p-4">
        <h3 className="text-center text-md font-bold tracking-tight text-gradient">
          Welcome Back!
        </h3>
        <p className="text-center text-xs text-muted-foreground/80 mt-1.5 mb-3 leading-relaxed">
          Log in to access your profile, share updates, and connect with the community.
        </p>
        <div className="flex flex-col space-y-2">
          <SignInButton mode="modal">
            <GradientButton variant="secondary" className="w-full py-2">
              Log In
            </GradientButton>
          </SignInButton>
          <SignUpButton mode="modal">
            <GradientButton variant="primary" className="w-full py-2">
              Sign Up
            </GradientButton>
          </SignUpButton>
        </div>
      </GlassPanel>
    </AnimatedContainer>
  </div>
);
