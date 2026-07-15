import Image from "next/image";
import logo from "@/public/logo.jpeg";

export default function Logo({ height = 28 }: { height?: number }) {
  const width = Math.round((height * logo.width) / logo.height);

  return (
    <Image
      src={logo}
      alt="Sidekick"
      height={height}
      width={width}
      priority
      className="block"
    />
  );
}
