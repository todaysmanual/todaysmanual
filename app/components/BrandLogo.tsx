/* eslint-disable @next/next/no-img-element */
export function BrandLogo({ src = "/todaysmanual1.png" }: { src?: string }) {
  return (
    <img
      className="brand-logo"
      src={src}
      alt="Today's Manual"
      width={1600}
      height={372}
    />
  );
}
