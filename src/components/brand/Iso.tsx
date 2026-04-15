import isoBlack from '../../assets/clic_iso_black.png';
import isoTaupe from '../../assets/clic_iso_taupe.png';
import isoWhite from '../../assets/clic_iso_white.png';

type Variant = 'black' | 'taupe' | 'white';

const srcMap: Record<Variant, string> = {
  black: isoBlack,
  taupe: isoTaupe,
  white: isoWhite,
};

export function Iso({
  variant = 'taupe',
  size = 32,
  style,
  className,
}: {
  variant?: Variant;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <img
      src={srcMap[variant]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain', ...style }}
    />
  );
}
