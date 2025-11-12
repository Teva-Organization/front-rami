import React from 'react';

export function PlantIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9c2-3 6-3 8 0 2-3 6-3 8 0-2 5-6 6-8 6v4" />
      <path d="M2 9c2 5 6 6 8 6" />
    </svg>
  );
}

export function WaterIcon({ small }: { small?: boolean }) {
  const size = small ? 14 : 18;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2s7 7 7 12a7 7 0 1 1-14 0c0-5 7-12 7-12z" />
    </svg>
  );
}

export function FertIcon({ small }: { small?: boolean }) {
  const size = small ? 14 : 18;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s-4-5-4-9a4 4 0 1 1 8 0c0 4-4 9-4 9z" />
      <path d="M9 10c1-2 3-3 3-6" />
    </svg>
  );
}

export function NoteIcon({ small }: { small?: boolean }) {
  const size = small ? 14 : 18;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h12v12H9l-5 5V4z" />
      <path d="M8 8h6M8 12h4" />
    </svg>
  );
}
