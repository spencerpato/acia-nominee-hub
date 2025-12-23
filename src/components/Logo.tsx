import { Crown } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-secondary" />
        {/* Inner background */}
        <div className="absolute inset-1 rounded-full bg-primary" />
        {/* Crown icon */}
        <Crown className="relative z-10 h-1/2 w-1/2 text-secondary" />
        {/* Laurel decorations */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Left laurel */}
          <path
            d="M20 50 C20 35, 30 25, 35 50 C30 45, 25 50, 20 50"
            className="fill-secondary/30"
          />
          <path
            d="M22 60 C22 48, 32 40, 36 58 C32 54, 27 58, 22 60"
            className="fill-secondary/30"
          />
          {/* Right laurel */}
          <path
            d="M80 50 C80 35, 70 25, 65 50 C70 45, 75 50, 80 50"
            className="fill-secondary/30"
          />
          <path
            d="M78 60 C78 48, 68 40, 64 58 C68 54, 73 58, 78 60"
            className="fill-secondary/30"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-serif font-bold text-primary ${textSizeClasses[size]}`}>
            ACIA
          </span>
          <span className="text-[0.6rem] font-sans tracking-widest text-muted-foreground uppercase">
            Awards
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
