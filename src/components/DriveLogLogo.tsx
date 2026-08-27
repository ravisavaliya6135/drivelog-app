import { useId } from 'react';

interface DriveLogLogoProps {
  className?: string;
  title?: string;
}

export function DriveLogLogo({ className, title }: DriveLogLogoProps) {
  const titleId = useId();

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <rect width="48" height="48" rx="12" fill="#0F172A" />
      <path
        d="M14 11.5h7.5c8 0 13 4.8 13 12.5s-5 12.5-13 12.5H14v-25Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 15.5v17"
        fill="none"
        stroke="#2DD4BF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="3 4"
      />
    </svg>
  );
}
