import { links } from "@/data/links";
import Link from "next/link";
export default function Header() {
  return (
    <header className="w-full flex gap-8 items-center justify-center py-4 sticky top-0 bg-white font-bold text-sm sm:text-base text-black z-[100]">
      {
        links.map(({title, url}, index) => {
            return (
                <Link href={url} key={index}>
                    {title}
                </Link>
            )
        })
      }
    </header>
  );
}
