import type { SVGProps } from 'react';

export function JustDevIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LazyBoyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" />
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function DrunkardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M2 2V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H22"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 17V10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 17V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 17V13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 17V8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ManualIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M18 11V13C18 15.2091 16.2091 17 14 17H8C5.79086 17 4 15.2091 4 13V8C4 5.79086 5.79086 4 8 4H10"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path d="M15 4H17C19.2091 4 21 5.79086 21 8V10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path
        d="M20.5 16.5C20.5 18.9853 18.4853 21 16 21C13.5147 21 11.5 18.9853 11.5 16.5C11.5 14.0147 13.5147 12 16 12C18.4853 12 20.5 14.0147 20.5 16.5Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M16 14.5V16.5L17.5 17.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
