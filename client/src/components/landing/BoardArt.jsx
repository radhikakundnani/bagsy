// Little hand-drawn "photos" for the landing inspo board.
// Thin lines, soft colours and a shared film grain (#lp-grain, defined in InspoBoard).

const INK = '#3B2F2A';

function Grain({ w = 80, h = 100, o = 0.35 }) {
  return <rect width={w} height={h} filter="url(#lp-grain)" opacity={o} />;
}

export function GrainFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <filter id="lp-grain">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 .55 0" />
      </filter>
    </svg>
  );
}

export function Sunset() {
  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      <defs>
        <linearGradient id="lp-s-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EBB8B4" />
          <stop offset=".55" stopColor="#F6CDB0" />
          <stop offset="1" stopColor="#FBE3C4" />
        </linearGradient>
        <linearGradient id="lp-s-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A7B5DA" />
          <stop offset="1" stopColor="#7F93C8" />
        </linearGradient>
      </defs>
      <rect width="80" height="100" fill="url(#lp-s-sky)" />
      <circle cx="40" cy="60" r="10" fill="#F3A27D" opacity=".9" />
      <rect y="60" width="80" height="26" fill="url(#lp-s-sea)" />
      <path d="M30 64h20M34 68h12M37 72h6" stroke="#FBE3C4" strokeWidth=".8" strokeLinecap="round" opacity=".9" />
      <path d="M0 86 Q40 82 80 86 V100 H0Z" fill="#EEDCC0" />
      <circle cx="58" cy="77" r="1.5" fill={INK} />
      <path d="M58 78.5v6" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      <Grain />
    </svg>
  );
}

function Jumper({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="2.6" fill="#FFFEFB" stroke={INK} strokeWidth=".6" />
      <path
        d={`M${x} ${y + 2.6}v8M${x} ${y + 5}l-4.5-4M${x} ${y + 5}l4.5-4M${x} ${y + 10.6}l-3 5M${x} ${y + 10.6}l3 5`}
        fill="none"
        stroke="#FFFEFB"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  );
}

export function Fort() {
  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      <defs>
        <linearGradient id="lp-f-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFD0EE" />
          <stop offset="1" stopColor="#EEE8DE" />
        </linearGradient>
        <linearGradient id="lp-f-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D8A97A" />
          <stop offset="1" stopColor="#B98558" />
        </linearGradient>
      </defs>
      <rect width="80" height="100" fill="url(#lp-f-sky)" />
      <circle cx="63" cy="17" r="6" fill="#FBEBC6" />
      <path d="M0 64h9v-6h8v6h10v-6h8v6h10v-6h8v6h10v-6h8v6h9V100H0Z" fill="url(#lp-f-wall)" />
      <path d="M0 76h80M0 88h80M16 64v12M40 64v12M64 64v12M28 76v12M52 76v12" stroke="#FFF6EA" strokeWidth=".5" opacity=".5" />
      <Jumper x={26} y={35} />
      <Jumper x={40} y={29} />
      <Jumper x={54} y={36} />
      <Grain />
    </svg>
  );
}

export function Plain({ fill }) {
  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      <rect width="80" height="100" fill={fill} />
    </svg>
  );
}

export function Outfit() {
  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      <rect width="80" height="100" fill="#F2E6DA" />
      <path d="M32 22l8 5 8-5 8 9-5 5-1-1 2 45H28l2-45-1 1-5-5z" fill="#FFFDF8" stroke={INK} strokeWidth=".7" strokeLinejoin="round" />
      <path d="M30 52q10 5 20 0" fill="none" stroke="#E8775A" strokeWidth="1" />
      <g fill="#E8775A">
        <circle cx="35" cy="62" r="1.2" />
        <circle cx="45" cy="66" r="1.2" />
        <circle cx="39" cy="72" r="1.2" />
        <circle cx="47" cy="76" r="1.2" />
      </g>
      <ellipse cx="62" cy="80" rx="11" ry="4" fill="#E6C78E" stroke={INK} strokeWidth=".6" />
      <ellipse cx="62" cy="78" rx="5.5" ry="3.5" fill="#EDD3A3" stroke={INK} strokeWidth=".6" />
      <path d="M56.6 79h10.8" stroke="#E8775A" strokeWidth="1.2" />
      <g fill="none" stroke={INK} strokeWidth=".7">
        <circle cx="14" cy="84" r="3.4" />
        <circle cx="22" cy="84" r="3.4" />
        <path d="M17.4 84h1.2" />
      </g>
      <Grain o={0.3} />
    </svg>
  );
}

export function Thali() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <defs>
        <linearGradient id="lp-t-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A9C46A" />
          <stop offset="1" stopColor="#7E9F3E" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" fill="url(#lp-t-leaf)" />
      <path d="M0 80L80 0M-10 50L30 90M20 -10L90 60" stroke="#C9DB97" strokeWidth=".5" opacity=".7" />
      <circle cx="40" cy="40" r="27" fill="#EFE8DA" stroke={INK} strokeWidth=".6" />
      <circle cx="40" cy="40" r="22" fill="#F6F1E7" />
      <circle cx="30" cy="31" r="6.5" fill="#F0C35A" stroke={INK} strokeWidth=".5" />
      <circle cx="47" cy="28" r="6" fill="#E8826A" stroke={INK} strokeWidth=".5" />
      <circle cx="52" cy="44" r="6" fill="#F8EED2" stroke={INK} strokeWidth=".5" />
      <ellipse cx="33" cy="49" rx="10" ry="5" fill="#D29C66" stroke={INK} strokeWidth=".5" transform="rotate(-16 33 49)" />
      <circle cx="26.5" cy="50" r=".8" fill={INK} />
      <Grain w={80} h={80} o={0.3} />
    </svg>
  );
}

export function Folder({ tab, body }) {
  return (
    <svg viewBox="0 0 60 46" aria-hidden="true">
      <path
        d="M1.5 6.5a3 3 0 0 1 3-3h15l4.5 4.5h31.5a3 3 0 0 1 3 3v29a3 3 0 0 1-3 3h-51a3 3 0 0 1-3-3z"
        fill={tab}
        stroke="#14100B"
        strokeWidth="1"
      />
      <path d="M1.5 14.5h57" stroke="#14100B" strokeWidth="1" />
      <path d="M2 15h56v24.5a2.5 2.5 0 0 1-2.5 2.5h-51A2.5 2.5 0 0 1 2 39.5z" fill={body} />
    </svg>
  );
}
