import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        Made with <span className="heart" aria-label="love">&hearts;</span> by{" "}
        <a href="https://github.com/AJ4200" target="_blank" rel="noopener noreferrer" className="accent">
          AJ4200
        </a>
        <a
          href="https://github.com/AJ4200"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icon footer-icon--inline"
          aria-label="AJ4200 on GitHub"
        >
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
      </p>
      <div className="footer-icons">
        <nav className="footer-links" aria-label="Legal">
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/cookies">Cookies</Link>
          <Link href="/legal/cache">Cache</Link>
          <Link href="/legal/terms">Terms</Link>
        </nav>
        <div className="eula">
          <Link href="/legal/eula" className="footer-icon" aria-label="End user licence agreement">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 2h9l5 5v15H6z" />
              <path d="M14 2v6h6M9 13h8M9 17h8" />
            </svg>
          </Link>
          <div className="eula-text" role="tooltip">
            <strong>End User Licence Agreement</strong>
            <p>
              AppoFlex is provided &ldquo;as is&rdquo;, without warranty of any kind. By using the service you
              agree to supply accurate information, to use it lawfully, and to keep your credentials
              secure. Providers are responsible for the services, prices and availability they publish.
              Appointment data and messages are stored to operate the service and are not sold to third
              parties. AI features send the text you submit to Groq for processing. We may suspend
              accounts that abuse the platform. All rights reserved &copy; AJ4200.
            </p>
            <Link href="/legal/eula" className="accent">Read the full agreement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
