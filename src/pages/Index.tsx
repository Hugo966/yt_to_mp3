import { BackgroundEffects } from "@/components/BackgroundEffects";
import { ConversionCard } from "@/components/ConversionCard";
import { FeatureCard } from "@/components/FeatureCard";
import { AudioWave } from "@/components/AudioWave";
import { Zap, Shield, Music2, Download, Headphones, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="container py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Music2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">SoundRip</span>
            </div>
            <AudioWave bars={4} className="opacity-50" />
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Fast & Free Conversion</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Convert Videos to{" "}
              <span className="gradient-text">MP3</span>{" "}
              in Seconds
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Extract high-quality audio from any video. Paste a URL, convert, and download your MP3 file instantly.
            </p>
          </div>

          <ConversionCard />
        </section>

        {/* Features Section */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text-accent">SoundRip</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for speed, quality, and simplicity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Our optimized servers process your videos in seconds, not minutes."
            />
            <FeatureCard
              icon={Headphones}
              title="High Quality Audio"
              description="Get crystal-clear 320kbps MP3 files for the best listening experience."
            />
            <FeatureCard
              icon={Shield}
              title="Private & Secure"
              description="Files are automatically deleted after download. Your privacy matters."
            />
            <FeatureCard
              icon={Download}
              title="No Registration"
              description="Start converting immediately. No sign-up or account required."
            />
            <FeatureCard
              icon={Music2}
              title="Multiple Sources"
              description="Supports YouTube, Vimeo, SoundCloud, and 100+ other platforms."
            />
            <FeatureCard
              icon={Clock}
              title="Unlimited Conversions"
              description="Convert as many videos as you want, completely free of charge."
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="container py-12 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Music2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold">SoundRip</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for educational purposes. Respect copyright laws.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
