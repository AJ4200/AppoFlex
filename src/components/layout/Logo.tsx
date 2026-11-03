import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function Logo() {
  return (
    <Link href="/" className="logo-link" aria-label="AppoFlex home">
      <Icon name="logo" size="1.8rem" className="logo-mark" />
      <span className="typewriter">
        <h1 className="logo">AppoFlex.</h1>
      </span>
    </Link>
  );
}
