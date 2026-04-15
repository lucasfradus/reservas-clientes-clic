import logoBlack from '../../assets/clic_logo_black.png';
import logoWhite from '../../assets/clic_logo_white.png';

type Variant = 'black' | 'white';

export function Logo({
  variant = 'black',
  height = 28,
}: {
  variant?: Variant;
  height?: number;
}) {
  const src = variant === 'black' ? logoBlack : logoWhite;
  return (
    <img
      src={src}
      alt="CLIC"
      height={height}
      style={{ height, width: 'auto' }}
    />
  );
}
