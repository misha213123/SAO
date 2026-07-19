type BattleHeroProps = {
  attacking?: boolean;
  defeated?: boolean;
};

export function BattleHero({ attacking = false, defeated = false }: BattleHeroProps) {
  return (
    <svg
      className={`battle-hero-art ${attacking ? 'is-attacking' : ''} ${defeated ? 'is-defeated' : ''}`}
      viewBox="0 0 360 620"
      role="img"
      aria-label="Оригинальный аниме-мечник первого этажа"
    >
      <defs>
        <linearGradient id="coatMain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14283b" />
          <stop offset="0.48" stopColor="#07101a" />
          <stop offset="1" stopColor="#23577a" />
        </linearGradient>
        <linearGradient id="coatEdge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ce7ff" />
          <stop offset="1" stopColor="#1d6a93" />
        </linearGradient>
        <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#26384c" />
          <stop offset="1" stopColor="#070d14" />
        </linearGradient>
        <linearGradient id="blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d7fbff" />
          <stop offset="0.5" stopColor="#79e4ff" />
          <stop offset="1" stopColor="#2a7ca5" />
        </linearGradient>
        <filter id="heroShadow" x="-40%" y="-30%" width="190%" height="190%">
          <feDropShadow dx="0" dy="16" stdDeviation="13" floodColor="#000" floodOpacity=".55" />
        </filter>
        <filter id="bladeGlow" x="-180%" y="-50%" width="460%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g className="hero-shadow"><ellipse cx="181" cy="581" rx="105" ry="21" fill="#001018" opacity=".55" /></g>

      <g className="hero-sword-back" filter="url(#bladeGlow)">
        <path d="M250 96L278 89 190 452 164 446z" fill="#082331" opacity=".9" />
        <path d="M257 103L268 99 186 438 176 436z" fill="url(#blade)" />
        <path d="M246 96l36-12-7 26-34 10z" fill="#9ceeff" />
        <path d="M164 438l32 8-15 32-31-12z" fill="#142b3d" stroke="#76dcfb" strokeWidth="3" />
      </g>

      <g className="hero-body" filter="url(#heroShadow)">
        <path d="M145 495l-16 84h44l8-84zM192 495l7 84h45l-17-88z" fill="#07111b" />
        <path d="M126 569h51v18h-62c-8 0-10-9-3-13zM195 569h51l13 8c6 4 3 12-5 12h-59z" fill="#101d29" stroke="#294d63" strokeWidth="2" />

        <path d="M112 258c19-31 45-45 70-45 28 0 57 14 77 47l-20 245H120z" fill="url(#coatMain)" />
        <path d="M132 261l48 49 50-50 17 226-52 11-15-145-16 145-53-12z" fill="#08131e" opacity=".94" />
        <path d="M181 309v185" stroke="url(#coatEdge)" strokeWidth="5" opacity=".85" />
        <path d="M136 266l44 44-22 26-39-49zM226 264l-46 46 23 27 40-52z" fill="#18364c" stroke="#4287a9" strokeWidth="2" />
        <path d="M119 283L73 433l45 14 49-124zM242 281l49 150-44 16-55-124z" fill="#0a1722" />
        <path d="M83 414l43 13-9 40-48-18zM276 411l-42 16 12 40 47-20z" fill="#142c3e" stroke="#32617a" strokeWidth="2" />
        <path d="M139 390h84" stroke="#69d9fa" strokeWidth="4" strokeLinecap="round" opacity=".8" />
        <path d="M147 421h68" stroke="#355d72" strokeWidth="10" strokeLinecap="round" />
        <rect x="174" y="411" width="18" height="20" rx="4" fill="#7edff8" stroke="#d3f8ff" strokeWidth="2" />

        <path d="M160 216h42l-4 48h-34z" fill="#dfb49b" />
        <path d="M127 142c4-57 30-91 66-91 43 0 69 39 61 101-4 35-26 76-63 77-38 1-66-38-64-87z" fill="#edc3a8" />

        <path d="M120 154c-8-67 27-112 78-111 42 0 72 31 71 82l-18-29-12 36-18-40-23 35-11-31-34 48-2 37-20-9z" fill="url(#hair)" />
        <path d="M137 116l-26 46 31-17-13 43 35-38 4-63zM209 78l12 58 26-30 7 53 20-35-9-55z" fill="#111d2a" />

        <path d="M148 157c12-10 25-12 37-5" fill="none" stroke="#28313a" strokeWidth="5" strokeLinecap="round" />
        <path d="M202 152c13-7 26-5 36 4" fill="none" stroke="#28313a" strokeWidth="5" strokeLinecap="round" />
        <g fill="#fff">
          <path d="M145 168c10-10 29-10 39 1-11 12-29 12-39-1z" />
          <path d="M202 168c10-10 29-10 39 1-11 12-29 12-39-1z" />
        </g>
        <g fill="#39b9e7">
          <ellipse cx="166" cy="169" rx="7" ry="9" />
          <ellipse cx="222" cy="169" rx="7" ry="9" />
        </g>
        <g fill="#06121c"><circle cx="166" cy="170" r="3"/><circle cx="222" cy="170" r="3"/></g>
        <g fill="#fff"><circle cx="163" cy="166" r="2"/><circle cx="219" cy="166" r="2"/></g>
        <path d="M190 170l-4 20 10 1" fill="none" stroke="#cb927f" strokeWidth="2" strokeLinecap="round" />
        <path d="M174 203c12 8 26 8 38 0" fill="none" stroke="#9e5b57" strokeWidth="3" strokeLinecap="round" />

        <path d="M116 296l-39 38 12 18 44-28z" fill="#14283a" />
        <path d="M248 295l36 37-12 19-43-27z" fill="#14283a" />
        <path d="M75 431c-8 11-6 29 7 36 11 7 28 3 34-10l-2-20zM286 430c9 10 8 28-5 36-11 7-27 4-34-9l1-20z" fill="#c48e78" />
        <path d="M76 423l42 13-7 31-43-15zM285 421l-41 16 9 31 42-18z" fill="#111e2b" />
      </g>

      <g className="hero-energy" fill="none" stroke="#79e4ff" strokeLinecap="round">
        <path d="M92 260c-27 30-35 68-27 109" strokeWidth="3" opacity=".55" />
        <path d="M277 257c29 30 37 72 26 111" strokeWidth="3" opacity=".4" />
        <path d="M91 248l-12-11M288 248l11-12" strokeWidth="6" />
      </g>
    </svg>
  );
}
