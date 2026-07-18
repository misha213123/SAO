type AnimeHeroProps = {
  variant: 'male' | 'female';
};

export function AnimeHero({ variant }: AnimeHeroProps) {
  const isMale = variant === 'male';

  return (
    <svg
      className={`anime-illustration ${variant}`}
      viewBox="0 0 320 420"
      role="img"
      aria-label={isMale ? 'Оригинальный аниме герой Каэл' : 'Оригинальная аниме героиня Мира'}
    >
      <defs>
        <linearGradient id={`${variant}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={isMale ? '#0c3150' : '#16384e'} />
          <stop offset="1" stopColor="#07131f" />
        </linearGradient>
        <linearGradient id={`${variant}-coat`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={isMale ? '#172a3b' : '#24374a'} />
          <stop offset="0.55" stopColor={isMale ? '#08121c' : '#101a28'} />
          <stop offset="1" stopColor={isMale ? '#246286' : '#31708c'} />
        </linearGradient>
        <linearGradient id={`${variant}-hair`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={isMale ? '#253646' : '#31566b'} />
          <stop offset="1" stopColor={isMale ? '#0d1620' : '#132634'} />
        </linearGradient>
        <radialGradient id={`${variant}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#73dcff" stopOpacity=".6" />
          <stop offset="1" stopColor="#73dcff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${variant}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity=".45" />
        </filter>
      </defs>

      <rect width="320" height="420" rx="24" fill={`url(#${variant}-bg)`} />
      <circle cx={isMale ? 235 : 82} cy="92" r="76" fill={`url(#${variant}-glow)`} />
      <g opacity=".55" fill="#8de6ff">
        <path d="M24 90h16v16H24z" transform="rotate(45 32 98)" />
        <path d="M274 146h11v11h-11z" transform="rotate(45 279 151)" />
        <path d="M44 250h8v8h-8z" transform="rotate(45 48 254)" />
      </g>

      {isMale && (
        <g opacity=".9" filter={`url(#${variant}-shadow)`}>
          <rect x="229" y="79" width="12" height="286" rx="6" fill="#102332" transform="rotate(18 235 222)" />
          <rect x="231" y="62" width="6" height="246" rx="3" fill="#8deaff" transform="rotate(18 234 185)" />
          <path d="M211 80l43-14-8 24-30 10z" fill="#7fe1ff" />
        </g>
      )}

      {!isMale && (
        <g opacity=".65" fill="none" stroke="#78ddff" strokeWidth="3">
          <path d="M62 145c-32 28-40 72-23 108" />
          <path d="M251 141c28 24 36 69 20 107" />
        </g>
      )}

      <g filter={`url(#${variant}-shadow)`}>
        <path
          d={isMale
            ? 'M94 370c8-80 23-129 58-148h22c39 19 55 68 62 148z'
            : 'M86 372c8-87 30-137 68-150h18c39 13 62 63 69 150z'}
          fill={`url(#${variant}-coat)`}
        />
        <path d="M136 221h48l-4 39h-40z" fill="#ddb39a" />
        <ellipse cx="160" cy="165" rx="48" ry="58" fill="#efc8ad" />

        {isMale ? (
          <path
            d="M109 171c-8-64 19-103 57-104 36-2 64 27 60 79-7-13-19-24-34-31-4 20-19 31-35 38-11 5-25 9-48 18z"
            fill={`url(#${variant}-hair)`}
          />
        ) : (
          <>
            <path d="M106 185c-10-72 18-120 58-121 45-1 76 44 66 124l-24-27-6 128-33-62-29 65-8-132z" fill={`url(#${variant}-hair)`} />
            <path d="M111 152c12-52 34-75 62-75 30 0 50 25 57 66-23-21-45-29-66-26-22 3-40 14-53 35z" fill="#203847" />
          </>
        )}

        <path d="M120 161c9-26 26-39 43-39 18 0 35 13 45 39-14-12-30-18-46-18-15 0-29 6-42 18z" fill="#efc8ad" />

        <g fill="#fff">
          <ellipse cx="143" cy="170" rx="10" ry="7" />
          <ellipse cx="178" cy="170" rx="10" ry="7" />
        </g>
        <g fill={isMale ? '#2e8fc0' : '#48a7c9'}>
          <ellipse cx="145" cy="171" rx="5" ry="6" />
          <ellipse cx="176" cy="171" rx="5" ry="6" />
        </g>
        <g fill="#07111a">
          <circle cx="145" cy="172" r="2.5" />
          <circle cx="176" cy="172" r="2.5" />
        </g>
        <path d="M152 194c6 4 12 4 18 0" fill="none" stroke="#b26e67" strokeWidth="2" strokeLinecap="round" />

        <path d="M121 246l39 31 40-31 18 124H103z" fill={isMale ? '#0d1823' : '#172432'} opacity=".92" />
        <path d="M160 275l-24-19 7-19h34l8 19z" fill={isMale ? '#183e58' : '#2b5f78'} />
        <path d="M159 278v91" stroke="#72d9fb" strokeWidth="3" opacity=".75" />
        <path d="M111 270l-25 98h42l17-78zM209 270l25 98h-42l-17-78z" fill="#0a131d" opacity=".92" />

        {isMale ? (
          <>
            <path d="M109 298l-20 67h42l12-56zM211 298l20 67h-42l-12-56z" fill="#142b3d" />
            <path d="M123 321h31M166 321h31" stroke="#4eaed1" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M123 286c10 14 24 22 37 22 14 0 28-8 39-22l-6 83h-66z" fill="#233c4d" />
            <path d="M112 303l-23 64h40l15-58zM208 303l23 64h-40l-15-58z" fill="#1c3343" />
            <path d="M130 320h60" stroke="#6fd8f8" strokeWidth="4" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
}
