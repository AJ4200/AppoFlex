import Link from "next/link";
import FlipLink from "@/components/ui/FlipLink";
import { getCurrentUser } from "@/lib/auth";

const FEATURES = [
  {
    title: "No overlaps, ever",
    body: "Every service has its own duration, so each appointment gets exactly the time it needs and double bookings are impossible.",
  },
  {
    title: "Real-time alerts",
    body: "Clients and providers are notified the moment anything changes: new bookings, reschedules, cancellations and delays.",
  },
  {
    title: "Running late? Tell everyone",
    body: "When an appointment runs over, the next customers are alerted automatically and offered the next available slot.",
  },
  {
    title: "Easy rescheduling",
    body: "Move or cancel an appointment in a couple of clicks. Both sides stay in sync without any phone tag.",
  },
  {
    title: "Built-in messaging",
    body: "Discuss requirements and preferences before, during and after an appointment, all in one thread.",
  },
  {
    title: "AI assistance",
    body: "Describe what you need in plain words and let the assistant find the right service, or draft polite messages for you.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="page">
      <div className="home-container">
        <section className="infopage glass">
          <h1>Welcome to AppoFlex</h1>
          <p className="typingeffect">
            AppoFlex is a dynamic and flexible appointment management system designed for clients and
            service providers, such as hairdressers. Say goodbye to scheduling conflicts and hello to a
            more efficient and satisfying experience for both sides.
          </p>
          <div className="hero-actions">
            {user ? (
              <FlipLink href="/dashboard" label="Dashboard" />
            ) : (
              <>
                <FlipLink href="/signup" label="Get started" variant="alt" />
                <FlipLink href="/signin" label="Sign In" />
              </>
            )}
          </div>
        </section>

        <section className="grid" aria-label="Features">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="feature-card glass glass--warm">
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="infopage glass">
          <h2>Ready to streamline your appointments?</h2>
          <p className="muted">
            Providers set up services and working hours once. Clients book the slot that suits them.{" "}
            {user ? null : (
              <>
                <Link href="/signup" className="accent">
                  Create a free account
                </Link>{" "}
                to begin.
              </>
            )}
          </p>
        </section>
      </div>
    </main>
  );
}
