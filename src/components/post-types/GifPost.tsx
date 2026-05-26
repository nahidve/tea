interface GifPostProps {
  gif: {
    gifUrl: string;
  };
}

function GifPost({ gif }: GifPostProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border/30 bg-muted/20">
      <img src={gif.gifUrl} alt="GIF" className="w-full object-cover" />
    </div>
  );
}

export default GifPost;
