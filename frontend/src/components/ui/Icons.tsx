type IconProps = { className?: string };

export function CheckIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function StarIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5Z" />
    </svg>
  );
}

export function PlusIcon({ className = "size-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function PhoneIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.6a1.5 1.5 0 0 1 1.46 1.14l.7 2.8a1.5 1.5 0 0 1-.43 1.46l-1.2 1.1a11 11 0 0 0 5.87 5.87l1.1-1.2a1.5 1.5 0 0 1 1.46-.43l2.8.7A1.5 1.5 0 0 1 18 14.9v1.6a1.5 1.5 0 0 1-1.5 1.5H15C7.82 18 2 12.18 2 5V3.5Z" />
    </svg>
  );
}
