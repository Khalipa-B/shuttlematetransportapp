interface ShuttleMateLogoProps {
  className?: string;
  showFullLogo?: boolean;
  variant?: 'blue' | 'white';
}

export default function ShuttleMateLogo({ 
  className = "h-10", 
  showFullLogo = false,
  variant = 'blue'
}: ShuttleMateLogoProps) {
  const logoSrc = variant === 'blue' 
    ? '/images/shuttlemate-logo-blue.png' 
    : '/images/shuttlemate-logo.png';
    
  return (
    <div className={`flex items-center ${showFullLogo ? "flex-col" : "flex-row"}`}>
      <img 
        src={logoSrc} 
        alt="ShuttleMate Logo" 
        className={`${className} object-contain`}
      />
      {showFullLogo && (
        <div className="mt-2 text-center">
          <p className={`text-lg font-bold ${variant === 'blue' ? 'text-primary' : 'text-white'}`}>
            ShuttleMate
          </p>
          <p className={`text-xs ${variant === 'blue' ? 'text-gray-600' : 'text-gray-200'}`}>
            Safe. Smart. Connected
          </p>
        </div>
      )}
    </div>
  );
}
