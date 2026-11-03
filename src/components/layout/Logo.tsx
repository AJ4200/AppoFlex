import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="typewriter" aria-label="AppoFlex home">
      <h1 className="logo">AppoFlex.</h1>
    </Link>
  );
}
