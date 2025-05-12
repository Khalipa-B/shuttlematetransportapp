interface ShuttleMateLogoProps {
  className?: string;
}

export default function ShuttleMateLogo({ className = "h-10" }: ShuttleMateLogoProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ShuttleMate Logo"
    >
      <circle cx="100" cy="85" r="65" fill="#0047AB" />
      <path d="M100 170 L160 90 L40 90 Z" fill="#0047AB" />
      <g fill="white">
        <rect x="60" y="60" width="80" height="50" rx="10" />
        <rect x="70" y="110" width="60" height="10" rx="5" />
        <circle cx="75" cy="125" r="8" />
        <circle cx="125" cy="125" r="8" />
      </g>
      <path d="M60 95 C60 95, 70 90, 100 90, 130 90, 140 95, 140 95" stroke="white" strokeWidth="3" fill="none" />
    </svg>
  );
}
