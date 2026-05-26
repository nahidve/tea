"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import GlassPanel from "./ui/custom/GlassPanel";
import GradientButton from "./ui/custom/GradientButton";
import AnimatedContainer from "./ui/custom/AnimatedContainer";

function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setIsPosting(true);
    try {
      const result = await createPost(content, imageUrl);
      if (result?.success) {
        // reset the form
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);

        toast.success("Post created successfully");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AnimatedContainer direction="up" delay={0.1} className="mb-4">
      <GlassPanel className="p-4">
        <div className="space-y-3.5">
          <div className="flex space-x-3">
            <Avatar className="w-9 h-9 border border-border/40">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[80px] resize-none border-none focus-visible:ring-0 p-0 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/75"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
          </div>

          {/* handle image upload */}
          {(showImageUpload || imageUrl) && (
            <AnimatedContainer direction="down" distance={6} className="border border-border/40 rounded-md p-2.5 bg-secondary/15">
              <ImageUpload
                endpoint="imageUploader"
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url);
                  if (!url) setShowImageUpload(false);
                }}
              />
            </AnimatedContainer>
          )}

          <div className="flex items-center justify-between border-t border-border/30 pt-3">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground/80 hover:text-primary hover:bg-secondary/40 rounded-md cursor-pointer h-8 px-2.5 text-xs font-medium"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting}
              >
                <ImageIcon className="size-3.5 mr-1.5" />
                Photo
              </Button>
            </div>
            <GradientButton
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || isPosting}
              loading={isPosting}
            >
              {!isPosting && (
                <>
                  <SendIcon className="size-3 mr-1.5" />
                  Post
                </>
              )}
              {isPosting && "Posting..."}
            </GradientButton>
          </div>
        </div>
      </GlassPanel>
    </AnimatedContainer>
  );
}

export default CreatePost;
