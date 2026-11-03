export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = {
  slug: string;
  title: string;
  summary: string;
  sections: LegalSection[];
};

export const LEGAL_UPDATED = "3 November 2026";
export const CONTACT = "https://github.com/AJ4200";

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "eula",
    title: "End User Licence Agreement",
    summary: "The terms under which you may use AppoFlex.",
    sections: [
      {
        heading: "1. Acceptance",
        body: [
          "By creating an account or using AppoFlex you agree to this agreement. If you do not agree, do not use the service.",
        ],
      },
      {
        heading: "2. Licence",
        body: [
          "AppoFlex grants you a personal, non-exclusive, non-transferable, revocable licence to use the service to book, manage and run appointments. You may not copy, resell, reverse engineer or attempt to extract the source of the service except where the law allows it.",
        ],
      },
      {
        heading: "3. Accounts",
        body: [
          "You must provide accurate information, keep your credentials secure and are responsible for activity under your account. Tell us promptly if you suspect unauthorised access.",
        ],
      },
      {
        heading: "4. Providers and clients",
        body: [
          "Providers are responsible for the services, prices, opening hours and availability they publish, and for honouring confirmed appointments. Clients are responsible for attending or cancelling in good time. AppoFlex is a scheduling tool and is not a party to any agreement between a client and a provider.",
        ],
      },
      {
        heading: "5. Acceptable use",
        body: [
          "Do not use AppoFlex unlawfully, to harass others, to send spam through messages, to probe or disrupt the service, or to upload malicious content. We may suspend or remove accounts that break these rules.",
        ],
      },
      {
        heading: "6. AI features",
        body: [
          "Optional AI features send the text you submit to Groq to generate suggestions and drafts. Suggestions may be inaccurate, so review them before use. Do not submit sensitive personal information to AI features.",
        ],
      },
      {
        heading: "7. Notifications",
        body: [
          "AppoFlex sends in-app alerts about bookings, changes, delays and messages. Alerts are best effort and should not be your only way of confirming an appointment.",
        ],
      },
      {
        heading: "8. Warranty and liability",
        body: [
          "The service is provided \u201Cas is\u201D and \u201Cas available\u201D without warranty of any kind. To the fullest extent permitted by law, AJ4200 is not liable for missed appointments, lost revenue, lost data or indirect damages arising from use of the service.",
        ],
      },
      {
        heading: "9. Termination",
        body: [
          "You may stop using AppoFlex at any time. We may suspend or end access if you breach this agreement. Sections that by nature should survive termination will do so.",
        ],
      },
      {
        heading: "10. Changes",
        body: [
          "We may update this agreement. Continued use after an update means you accept the new version. All rights reserved \u00A9 AJ4200.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    summary: "What data we keep, why, and who processes it.",
    sections: [
      {
        heading: "Data we collect",
        body: [
          "Account details (name, email, role and a salted password hash), provider profile and services, appointments, messages and in-app notifications.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "Only to operate AppoFlex: authenticating you, preventing overlapping bookings, alerting the people involved in an appointment and enabling messaging. We do not sell your data or use it for advertising.",
        ],
      },
      {
        heading: "Who processes it",
        body: [
          "Neon hosts our PostgreSQL database. Groq processes text you submit to AI features. Our hosting provider serves the application. Each handles data only to provide its service.",
        ],
      },
      {
        heading: "Who can see what",
        body: [
          "A provider sees the clients booked with them; a client sees their own appointments and the public provider profiles. Messages are visible only to the two people on that appointment.",
        ],
      },
      {
        heading: "Retention and deletion",
        body: [
          "We keep data for as long as your account exists so appointment history stays accurate. Ask us to delete your account and associated data at any time.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask to access, correct, export or delete your data. Contact us through the link in the footer.",
        ],
      },
      {
        heading: "Security",
        body: [
          "Passwords are hashed, sessions use signed httpOnly cookies and connections use TLS. No system is perfectly secure, so use a strong unique password.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookies and Storage",
    summary: "The cookies and browser storage AppoFlex uses.",
    sections: [
      {
        heading: "Cookies we set",
        body: [
          "appoflex_session: a signed, httpOnly session cookie that keeps you signed in. It is strictly necessary, is sent only to AppoFlex and is removed when you sign out or it expires.",
        ],
      },
      {
        heading: "What we do not use",
        body: [
          "No advertising, tracking or analytics cookies, and no third-party cookies. Because we only use strictly necessary cookies, no consent banner is required.",
        ],
      },
      {
        heading: "Local storage",
        body: [
          "AppoFlex does not store personal data in localStorage or sessionStorage. The splash animation plays on each load and keeps no record of your visits.",
        ],
      },
      {
        heading: "Managing cookies",
        body: [
          "You can clear or block cookies in your browser settings, but you will not be able to stay signed in without the session cookie.",
        ],
      },
    ],
  },
  {
    slug: "cache",
    title: "Caching",
    summary: "How pages, data and assets are cached.",
    sections: [
      {
        heading: "Static assets",
        body: [
          "Scripts, styles, fonts and icons are fingerprinted and cached by your browser and by a CDN so the app loads quickly. A new release uses new file names, so you always get the latest version.",
        ],
      },
      {
        heading: "Personal pages",
        body: [
          "Pages that show your appointments, messages and notifications are rendered per request for the signed-in user and are not shared between users.",
        ],
      },
      {
        heading: "Slot availability",
        body: [
          "Free times are calculated live from the database when you open a booking form. A slot is only secured when you confirm, and the database rejects overlapping bookings, so a stale view cannot cause a double booking.",
        ],
      },
      {
        heading: "Clearing the cache",
        body: [
          "If something looks out of date, do a hard refresh (Ctrl+Shift+R) or clear site data in your browser.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    summary: "Rules for bookings, cancellations and conduct.",
    sections: [
      {
        heading: "Bookings",
        body: [
          "A booking is confirmed once you receive confirmation in AppoFlex. Durations come from the service the provider defines and slots never overlap.",
        ],
      },
      {
        heading: "Cancellations and changes",
        body: [
          "Clients and providers can reschedule or cancel from the appointment page. Providers may set their own cancellation expectations outside the app.",
        ],
      },
      {
        heading: "Delays",
        body: [
          "If an appointment runs long, the provider can record a delay. AppoFlex then alerts affected clients and moves them to the next available time where possible.",
        ],
      },
      {
        heading: "Payments",
        body: [
          "AppoFlex does not process payments. Prices shown are set by providers and are settled directly between client and provider.",
        ],
      },
      {
        heading: "Conduct",
        body: [
          "Treat others respectfully. Abusive messages or repeated no-shows may lead to account suspension.",
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string) {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
