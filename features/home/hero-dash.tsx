import Image from "next/image";

export default function HeroDash() {
  return (
    <div className="relative overflow-hidden h-full w-full">
      <Image fill className="object-cover" alt="dashimg" src={"/dash.png"} />
    </div>
  );
}
