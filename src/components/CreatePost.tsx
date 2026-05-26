"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon, ImagePlayIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import GlassPanel from "./ui/custom/GlassPanel";
import GradientButton from "./ui/custom/GradientButton";
import AnimatedContainer from "./ui/custom/AnimatedContainer";
import GifPicker from "./GifPicker";

function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedGif, setSelectedGif] = useState<{
    gifUrl: string;
    previewUrl?: string;
  } | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && imageUrls.length === 0 && !selectedGif) return;

    setIsPosting(true);
    try {
      const result = await createPost(content, imageUrls, selectedGif);
      if (result?.success) {
        // reset the form
        setContent("");
        setImageUrls([]);
        setShowImageUpload(false);
        setSelectedGif(null);
        setShowGifPicker(false);

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
          {(showImageUpload || imageUrls.length > 0) && (
            <AnimatedContainer
              direction="down"
              distance={6}
              className="border border-border/40 rounded-md p-2.5 bg-secondary/15"
            >
              <ImageUpload
                endpoint="imageUploader"
                value={imageUrls}
                onChange={(urls) => {
                  setImageUrls(urls);

                  if (urls.length === 0) {
                    setShowImageUpload(false);
                  }
                }}
              />
            </AnimatedContainer>
          )}

          {showGifPicker && (
            <AnimatedContainer
              direction="down"
              distance={6}
              className="border border-border/40 rounded-md p-2.5 bg-secondary/15"
            >
              <GifPicker
                onSelect={(gif) => {
                  setSelectedGif(gif);

                  setImageUrls([]);
                  setShowImageUpload(false);
                  setShowGifPicker(false);
                }}
              />
            </AnimatedContainer>
          )}

          {selectedGif && (
            <div className="rounded-md overflow-hidden border border-border/30">
              <img
                src={selectedGif.gifUrl}
                alt="Selected GIF"
                className="w-full max-h-[420px] object-cover"
              />
            </div>
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
              {/* add gif button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground/80 hover:text-primary hover:bg-secondary/40 rounded-md cursor-pointer h-8 px-2.5 text-xs font-medium"
                onClick={() => {
                  setShowGifPicker((prev) => !prev);

                  if (!showGifPicker) {
                    setImageUrls([]);
                    setShowImageUpload(false);
                  }
                }}
                disabled={isPosting}
              >
                <ImagePlayIcon className="size-3.5 mr-1.5" />
                GIF
              </Button>
            </div>
            <GradientButton
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={
                (!content.trim() && imageUrls.length === 0) || isPosting
              }
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
