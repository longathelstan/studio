import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12c.5-2.5 2-4 4.5-4s4 1.5 4.5 4-2 4-4.5 4-4-1.5-4.5-4z" />
      <path d="M13 12c.5-2.5 2-4 4.5-4s4 1.5 4.5 4-2 4-4.5 4-4-1.5-4.5-4z" />
    </svg>
  );
}
