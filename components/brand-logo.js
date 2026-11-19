import Image from 'next/image';

export default function BrandLogo({ className = '', variant = 'default', size = 'medium', tagline }) {
  const classes = ['brand-lockup', `brand-lockup--${variant}`, `brand-lockup--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      <Image
        className="brand-lockup__image"
        src="/logo.png"
        alt=""
        width={80}
        height={80}
        sizes="52px"
      />
      <span className="brand-lockup__copy">
        <span className="brand-lockup__name">SchoolConnect <strong>360</strong></span>
        {tagline && <span className="brand-lockup__tagline">{tagline}</span>}
      </span>
    </span>
  );
}
