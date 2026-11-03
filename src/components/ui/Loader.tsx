export default function Loader({ label = "Loading" }: { label?: string }) {
  return <span className="loader" role="status" aria-label={label} />;
}
