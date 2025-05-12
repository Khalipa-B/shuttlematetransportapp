import logoImage from "@assets/ShuttleMate Logo2 (1).jpg";

interface ShuttleMateLogoProps {
  className?: string;
  showFullLogo?: boolean;
}

export default function ShuttleMateLogo({ className = "h-10", showFullLogo = false }: ShuttleMateLogoProps) {
  return (
    <div className={`flex items-center ${showFullLogo ? "flex-col" : "flex-row"}`}>
      <img 
        src={logoImage} 
        alt="ShuttleMate Logo" 
        className={className}
      />
      {showFullLogo && (
        <div className="mt-2 text-center">
          <p className="text-lg font-bold text-primary">ShuttleMate</p>
          <p className="text-xs text-gray-600">Safe. Smart. Connected</p>
        </div>
      )}
    </div>
  );
}
