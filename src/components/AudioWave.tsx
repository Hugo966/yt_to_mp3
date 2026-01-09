import { cn } from "@/lib/utils";

interface AudioWaveProps {
  className?: string;
  bars?: number;
  isAnimating?: boolean;
}

export const AudioWave = ({ className, bars = 5, isAnimating = true }: AudioWaveProps) => {
  return (
    <div className={cn("flex items-end gap-1 h-8", className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-gradient-to-t from-primary to-accent rounded-full",
            isAnimating && "animate-wave"
          )}
          style={{
            height: `${Math.random() * 50 + 50}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};
