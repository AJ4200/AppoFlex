interface HamburgerProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

export default function Hamburger({ isMenuOpen, toggleMenu }: HamburgerProps) {
  return (
    <button
      type="button"
      className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}
      onClick={toggleMenu}
      aria-expanded={isMenuOpen}
      aria-label="Toggle menu"
    >
      <span className="bar" />
      <span className="bar" />
      <span className="bar" />
    </button>
  );
}
