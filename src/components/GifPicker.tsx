"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";

interface GifPickerProps {
  onSelect: (gif: { gifUrl: string; previewUrl?: string }) => void;
}

function GifPicker({ onSelect }: GifPickerProps) {
  const [query, setQuery] = useState("trending");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&q=${query}&limit=18`,
        );
        console.log(process.env.NEXT_PUBLIC_GIPHY_API_KEY);
        const data = await res.json();
        setResults(data.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(search, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs"
          className="w-full rounded-md border border-border bg-background pl-10 pr-4 py-2 text-sm outline-none"
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading GIFs...</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto">
          {results.map((gif) => {
            const gifUrl = gif.images.fixed_height.url;

            return (
              <button
                key={gif.id}
                onClick={() =>
                  onSelect({
                    gifUrl,
                    previewUrl: gif.images.fixed_height_small?.url,
                  })
                }
                className="overflow-hidden rounded-md border border-border/30 hover:opacity-90 transition-opacity"
              >
                <img
                  src={gifUrl}
                  alt="GIF"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GifPicker;
