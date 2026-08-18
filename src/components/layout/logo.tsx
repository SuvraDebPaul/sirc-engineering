import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  url?: string;
  src?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
};

const Logo = ({
  url = "/",
  src = "/images/sirc-logo.png",
  alt = "Sirc Logo",
  className,
  width = 200,
  height = 200,
}: LogoProps) => {
  return (
    <Link href={url}>
      <Image
        src={src}
        className={cn("h-20 object-contain", className)}
        alt={alt}
        width={width}
        height={height}
      />
    </Link>
  );
};

export default Logo;
