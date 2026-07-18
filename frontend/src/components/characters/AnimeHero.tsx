type AnimeHeroProps = {
  variant: 'male' | 'female';
};

export function AnimeHero({ variant }: AnimeHeroProps) {
  const male = variant === 'male';
  const p = `${variant}-hero`;

  return (
    <svg
      className={`anime-illustration ${variant}`}
      viewBox="0 0 360 520"
      role="img"
      aria-label={male ? 'Оригинальный аниме мечник Каэл' : 'Оригинальная аниме героиня Мира'}
    >
      <defs>
        <linearGradient id={`${p}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={male ? '#123f67' : '#25396a'} />
          <stop offset=".55" stopColor={male ? '#071c31' : '#111b3c'} />
          <stop offset="1" stopColor="#050b17" />
        </linearGradient>
        <radialGradient id={`${p}-halo`} cx={male ? '70%' : '35%'} cy="30%" r="48%">
          <stop offset="0" stopColor={male ? '#46c8ff' : '#9d7dff'} stopOpacity=".72" />
          <stop offset=".45" stopColor={male ? '#219bd0' : '#7454d8'} stopOpacity=".18" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-hair`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={male ? '#26354b' : '#58458d'} />
          <stop offset=".45" stopColor={male ? '#0e1727' : '#282044'} />
          <stop offset="1" stopColor={male ? '#02060e' : '#100b20'} />
        </linearGradient>
        <linearGradient id={`${p}-coat`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={male ? '#24364f' : '#453966'} />
          <stop offset=".42" stopColor={male ? '#080f1c' : '#171228'} />
          <stop offset=".78" stopColor={male ? '#14283d' : '#2c2250'} />
          <stop offset="1" stopColor={male ? '#2875a0' : '#7058a8'} />
        </linearGradient>
        <linearGradient id={`${p}-metal`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#314f63" />
          <stop offset=".45" stopColor="#d8f6ff" />
          <stop offset=".65" stopColor="#69d9ff" />
          <stop offset="1" stopColor="#193848" />
        </linearGradient>
        <filter id={`${p}-shadow`} x="-40%" y="-30%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity=".58" />
        </filter>
        <filter id={`${p}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="360" height="520" rx="28" fill={`url(#${p}-bg)`} />
      <rect width="360" height="520" rx="28" fill={`url(#${p}-halo)`} />

      <g opacity=".55">
        <path d="M28 112l14-14 14 14-14 14z" fill={male ? '#6bdcff' : '#a98cff'} />
        <path d="M298 90l9-9 9 9-9 9z" fill={male ? '#6bdcff' : '#a98cff'} />
        <path d="M315 286l11-11 11 11-11 11z" fill={male ? '#6bdcff' : '#a98cff'} />
        <circle cx="58" cy="342" r="3" fill="#fff" />
        <circle cx="292" cy="220" r="2.5" fill="#fff" />
      </g>

      {male ? (
        <g filter={`url(#${p}-glow)`}>
          <path d="M278 62l13 5-78 331-13-5z" fill="#52d7ff" opacity=".8" />
          <path d="M281 58l8 3-77 330-8-3z" fill="#e4fbff" />
          <path d="M261 92l41-21-7 35-39 11z" fill="#8ce8ff" />
          <path d="M201 396l17 5-8 35-18-5z" fill="#162636" />
        </g>
      ) : (
        <g fill="none" stroke="#9f89ff" opacity=".62" filter={`url(#${p}-glow)`}>
          <path d="M63 153c-41 55-42 123-5 178" strokeWidth="3" />
          <path d="M295 148c44 55 47 121 12 180" strokeWidth="3" />
          <path d="M72 169c-27 42-28 92-5 132" strokeWidth="1.5" />
        </g>
      )}

      <g filter={`url(#${p}-shadow)`}>
        {/* back hair */}
        {!male && (
          <path
            d="M111 125c14-54 50-82 82-78 46 5 74 48 68 115l17 166-46-55-12 138-35-113-40 119-8-145-48 63 22-210z"
            fill={`url(#${p}-hair)`}
          />
        )}

        {/* neck */}
        <path d="M153 220h55l-4 59h-50z" fill="#d99b82" />
        <path d="M158 224h44l-3 29c-15 12-27 14-40 3z" fill="#c9826d" opacity=".46" />

        {/* torso silhouette */}
        <path
          d={male
            ? 'M91 501c4-110 21-194 67-232 15-13 41-15 61-2 48 32 67 116 69 234z'
            : 'M87 501c7-111 26-193 69-226 18-14 44-15 63-1 44 33 63 115 67 227z'}
          fill={`url(#${p}-coat)`}
        />

        {/* face */}
        <path
          d={male
            ? 'M119 136c7-43 34-72 72-72 43 0 70 33 68 78-2 51-29 96-69 99-40 3-76-49-71-105z'
            : 'M119 137c5-45 34-75 73-75 42 0 70 33 69 78-1 53-30 96-70 99-41 2-78-48-72-102z'}
          fill="#efbda1"
        />
        <path d="M124 164c7 43 32 72 66 75-34 5-67-27-74-70z" fill="#d9937c" opacity=".18" />

        {/* ears */}
        <ellipse cx="119" cy="163" rx="9" ry="15" fill="#e9ae94" />
        <ellipse cx="260" cy="162" rx="9" ry="15" fill="#e9ae94" />

        {/* hair crown and bangs */}
        {male ? (
          <>
            <path d="M111 151c-3-65 31-108 83-108 46 0 78 32 76 91-16-26-34-38-58-48-7 24-30 42-53 55-13 7-28 12-48 17z" fill={`url(#${p}-hair)`} />
            <path d="M123 111l19-45 10 33 25-52 7 44 34-39-7 47 42-27-24 57-32-5-32 27-29-4z" fill={`url(#${p}-hair)`} />
            <path d="M132 115c17 2 34-4 51-19-4 24-18 42-45 53z" fill="#34495f" opacity=".5" />
          </>
        ) : (
          <>
            <path d="M109 150c-1-64 32-108 83-108 47 0 80 38 76 100-18-29-41-47-72-54-11 27-33 48-63 64z" fill={`url(#${p}-hair)`} />
            <path d="M124 111l22-51 14 34 29-55 4 45 37-34-13 47 37-14-23 47-34-15-26 32-24-8z" fill={`url(#${p}-hair)`} />
            <path d="M223 85c19 22 29 52 27 86-12-25-24-40-44-56z" fill="#7a63a5" opacity=".38" />
          </>
        )}

        {/* brows */}
        <path d="M140 152c12-8 24-9 36-3" stroke={male ? '#202535' : '#44345d'} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M207 149c12-5 24-3 34 5" stroke={male ? '#202535' : '#44345d'} strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* eyes */}
        <path d="M139 170c10-12 27-13 39-1-10 14-28 15-39 1z" fill="#fff" />
        <path d="M204 169c11-11 28-10 38 2-11 13-28 13-38-2z" fill="#fff" />
        <ellipse cx="160" cy="170" rx="8" ry="11" fill={male ? '#4bbcf1' : '#9c7cff'} />
        <ellipse cx="221" cy="170" rx="8" ry="11" fill={male ? '#4bbcf1' : '#9c7cff'} />
        <ellipse cx="160" cy="172" rx="4" ry="7" fill="#07111c" />
        <ellipse cx="221" cy="172" rx="4" ry="7" fill="#07111c" />
        <circle cx="157" cy="166" r="2.5" fill="#fff" />
        <circle cx="218" cy="166" r="2.5" fill="#fff" />
        <path d="M137 169c11-13 29-14 42 0M203 169c12-12 29-11 40 2" stroke="#1b1722" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* nose and mouth */}
        <path d="M189 176l-4 15 8 1" stroke="#b97468" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".75" />
        <path d={male ? 'M173 207c10 5 22 5 32-1' : 'M173 205c11 7 24 7 34-1'} stroke="#a9525c" strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* collar */}
        <path d="M145 267l43 35 44-37-15 64-29-17-29 18z" fill={male ? '#102b40' : '#34275a'} />
        <path d="M188 302v185" stroke={male ? '#47c8f7' : '#9d86ff'} strokeWidth="4" opacity=".75" />
        <path d="M146 267l-30 38 33 20 39-23zM230 266l31 38-34 21-39-23z" fill={male ? '#1c3650' : '#4a3972'} />

        {/* jacket details */}
        <path d="M112 319l-35 178h55l28-139zM257 319l35 178h-55l-27-139z" fill="#070d17" opacity=".9" />
        <path d="M110 344l34 16-15 72-39-9zM267 344l-34 16 15 72 39-9z" fill={male ? '#182a40' : '#33284f'} />
        <path d="M126 391h43M207 391h43" stroke={male ? '#3da6d0' : '#8069c5'} strokeWidth="4" strokeLinecap="round" />
        <path d="M143 338l20 18M231 338l-20 18" stroke="#a8dff2" strokeWidth="2" opacity=".45" />
        <path d="M157 452h63" stroke={male ? '#4acbf6' : '#9d85ff'} strokeWidth="5" strokeLinecap="round" opacity=".7" />

        {/* belt */}
        <path d="M119 463h139l-2 25H121z" fill="#080c13" />
        <rect x="175" y="463" width="30" height="25" rx="4" fill={`url(#${p}-metal)`} />
        <rect x="181" y="469" width="18" height="13" rx="2" fill="#08131d" />

        {/* female outfit accents */}
        {!male && (
          <>
            <path d="M157 330h62l-9 57h-45z" fill="#201735" />
            <path d="M165 386h45" stroke="#8e73e5" strokeWidth="4" />
            <path d="M133 286c-6 42 3 78 29 108" stroke="#7f67ca" strokeWidth="3" fill="none" />
            <path d="M243 285c7 42-1 77-26 109" stroke="#7f67ca" strokeWidth="3" fill="none" />
          </>
        )}
      </g>

      <g opacity=".75" fill={male ? '#63d8ff' : '#aa91ff'}>
        <path d="M50 405l8-8 8 8-8 8z" />
        <path d="M300 374l6-6 6 6-6 6z" />
      </g>
    </svg>
  );
}
