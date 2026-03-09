import { motion } from "framer-motion";

export function ECGLine() {
  // SVG path for a realistic ECG/heartbeat waveform
  const ecgPath = "M0,50 L30,50 L35,50 L40,20 L45,80 L50,10 L55,90 L60,50 L65,50 L100,50 L130,50 L135,50 L140,20 L145,80 L150,10 L155,90 L160,50 L165,50 L200,50 L230,50 L235,50 L240,20 L245,80 L250,10 L255,90 L260,50 L265,50 L300,50";

  return (
    <div className="w-full h-20 overflow-hidden opacity-40">
      <svg
        viewBox="0 0 300 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--healthcare-teal))" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(var(--healthcare-teal))" stopOpacity="1" />
            <stop offset="70%" stopColor="hsl(var(--healthcare-pulse))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--healthcare-blue))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={ecgPath}
          fill="none"
          stroke="url(#ecg-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 2, repeat: Infinity, ease: "linear" },
            opacity: { duration: 0.5 },
          }}
        />
        {/* Glow effect */}
        <motion.path
          d={ecgPath}
          fill="none"
          stroke="url(#ecg-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity={0.15}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            pathLength: { duration: 2, repeat: Infinity, ease: "linear" },
          }}
        />
      </svg>
    </div>
  );
}
