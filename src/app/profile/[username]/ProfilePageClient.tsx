"use client";

import {
  getProfileByUsername,
  getUserPosts,
  updateProfile,
} from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
  UserPlusIcon,
  UserXIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import GlassPanel from "@/components/ui/custom/GlassPanel";
import StatCard from "@/components/ui/custom/StatCard";
import GradientButton from "@/components/ui/custom/GradientButton";
import AnimatedContainer from "@/components/ui/custom/AnimatedContainer";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
}

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateProfile(formData);
    if (result.success) {
      setShowEditDialog(false);
      toast.success("Profile updated successfully");
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? `Unfollowed @${user.username}` : `Followed @${user.username}`);
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        <AnimatedContainer direction="up" delay={0.05} className="w-full">
          <GlassPanel className="p-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-primary/10 to-primary/30">
                <Avatar className="w-20 h-20 border-2 border-background shadow-lg">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>
              </div>

              <h1 className="mt-3 text-xl font-bold tracking-tight text-gradient">
                {user.name ?? user.username}
              </h1>
              <p className="text-xs text-muted-foreground/90 font-medium">@{user.username}</p>
              {user.bio && (
                <p className="mt-2.5 text-xs text-foreground/80 max-w-md italic">
                  "{user.bio}"
                </p>
              )}

              {/* PROFILE STATS */}
              <div className="w-full mt-4 grid grid-cols-3 gap-2">
                <StatCard value={user._count.following.toLocaleString()} label="Following" />
                <StatCard value={user._count.followers.toLocaleString()} label="Followers" />
                <StatCard value={user._count.posts.toLocaleString()} label="Posts" />
              </div>

              {/* "FOLLOW & EDIT PROFILE" BUTTONS */}
              <div className="w-full mt-3.5">
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <GradientButton variant="primary" className="w-full py-2">
                      <UserPlusIcon className="size-3.5 mr-1.5" />
                      Follow
                    </GradientButton>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <GradientButton
                    variant="secondary"
                    className="w-full py-2"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <EditIcon className="size-3.5 mr-1.5" />
                    Edit Profile
                  </GradientButton>
                ) : (
                  <GradientButton
                    variant={isFollowing ? "secondary" : "primary"}
                    className="w-full py-2"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                    loading={isUpdatingFollow}
                  >
                    {isFollowing ? (
                      <>
                        <UserXIcon className="size-3.5 mr-1.5" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="size-3.5 mr-1.5" />
                        Follow
                      </>
                    )}
                  </GradientButton>
                )}
              </div>

              {/* LOCATION & WEBSITE */}
              <div className="w-full mt-4 pt-3 border-t border-border/30 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs justify-items-center">
                {user.location ? (
                  <div className="flex items-center text-muted-foreground/80 hover:text-foreground transition-colors">
                    <MapPinIcon className="size-3.5 mr-1.5 text-muted-foreground/50" />
                    {user.location}
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground/40">
                    <MapPinIcon className="size-3.5 mr-1.5 opacity-55" />
                    No location
                  </div>
                )}
                {user.website ? (
                  <div className="flex items-center text-muted-foreground/80 hover:text-foreground transition-colors max-w-full truncate">
                    <LinkIcon className="size-3.5 mr-1.5 text-muted-foreground/50 shrink-0" />
                    <a
                      href={
                        user.website.startsWith("http")
                          ? user.website
                          : `https://${user.website}`
                      }
                      className="hover:underline truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.website}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground/40">
                    <LinkIcon className="size-3.5 mr-1.5 opacity-55" />
                    No website
                  </div>
                )}
                <div className="flex items-center text-muted-foreground/80">
                  <CalendarIcon className="size-3.5 mr-1.5 text-muted-foreground/50" />
                  Joined {formattedDate}
                </div>
              </div>
            </div>
          </GlassPanel>
        </AnimatedContainer>

        <AnimatedContainer direction="up" delay={0.1}>
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start border-b border-border/30 rounded-none h-auto p-0 bg-transparent mb-4">
              <TabsTrigger
                value="posts"
                className="flex items-center gap-1.5 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                 data-[state=active]:bg-transparent px-4 py-2 font-medium text-xs cursor-pointer"
              >
                <FileTextIcon className="size-3.5" />
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="likes"
                className="flex items-center gap-1.5 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                 data-[state=active]:bg-transparent px-4 py-2 font-medium text-xs cursor-pointer"
              >
                <HeartIcon className="size-3.5" />
                Likes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-0 focus-visible:outline-none">
              <div className="space-y-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} dbUserId={user.id} />
                  ))
                ) : (
                  <GlassPanel className="text-center py-12 text-muted-foreground">
                    No posts yet
                  </GlassPanel>
                )}
              </div>
            </TabsContent>

            <TabsContent value="likes" className="mt-0 focus-visible:outline-none">
              <div className="space-y-4">
                {likedPosts.length > 0 ? (
                  likedPosts.map((post) => (
                    <PostCard key={post.id} post={post} dbUserId={user.id} />
                  ))
                ) : (
                  <GlassPanel className="text-center py-12 text-muted-foreground">
                    No liked posts to show
                  </GlassPanel>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </AnimatedContainer>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[480px] glass-panel border border-border/40">
            <DialogHeader className="pb-3 border-b border-border/30">
              <DialogTitle className="text-left font-bold tracking-tight text-gradient">Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-3.5 py-3.5 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Name</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Your name"
                  className="rounded-md border border-border/45 bg-secondary/15 focus-visible:ring-1 focus-visible:ring-ring/40 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Bio</Label>
                <Textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  className="min-h-[80px] rounded-md border border-border/45 bg-secondary/15 focus-visible:ring-1 focus-visible:ring-ring/40 text-xs"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Location</Label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  placeholder="Where are you based?"
                  className="rounded-md border border-border/45 bg-secondary/15 focus-visible:ring-1 focus-visible:ring-ring/40 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Website</Label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  placeholder="Your personal website"
                  className="rounded-md border border-border/45 bg-secondary/15 focus-visible:ring-1 focus-visible:ring-ring/40 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border/30">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-md text-xs font-medium h-8.5 px-3.5 cursor-pointer">Cancel</Button>
              </DialogClose>
              <GradientButton
                variant="primary"
                size="sm"
                className="h-8.5 px-3.5"
                onClick={handleEditSubmit}
              >
                Save Changes
              </GradientButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
export default ProfilePageClient;
