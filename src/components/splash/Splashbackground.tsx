export default function Splashbackground() {
  return (
    <div className="splash-background" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
