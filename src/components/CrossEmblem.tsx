import { useState } from 'react';
import type { LiturgicalColor } from '../lib/types';

export function CrossEmblem({
  size = 40,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 overflow-hidden rounded-lg bg-[#5A101A] border border-[#B88B2E]/50 flex items-center justify-center ${className}`}
    >
      {!imgError ? (
        <img
          src="/src/assets/images/gold_cross_emblem_1794775563323.jpg"
          alt="Gold Latin cross on burgundy leather"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 32 32"
          className="h-3/4 w-3/4 text-[#D4AF5A]"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M14 4h4v8h7v4h-7v12h-4V16H7v-4h7V4z" />
        </svg>
      )}
    </div>
  );
}

const COLOR_HEX: Record<LiturgicalColor, string> = {
  white: '#F7F3EA',
  red: '#9B2330',
  violet: '#5B3169',
  green: '#275937',
  rose: '#B86B77',
  black: '#1F1B1A',
};

export function LiturgicalColorSwatch({
  color,
  label,
}: {
  color: LiturgicalColor;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rounded-xs border border-[#1F1815]/30"
        style={{ backgroundColor: COLOR_HEX[color] }}
      />
      <span>{label}</span>
    </span>
  );
}
