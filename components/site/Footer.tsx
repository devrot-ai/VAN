/**
 * VAN — Footer Component
 *
 * Professional footer with navigation links, company info, and legal.
 */

import Link from "next/link";
import { Logo } from "./Header";
import styles from "./Site.module.css";

const FOOTER_LINKS = [
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Company", href: "/company" },
      { label: "For Farmers", href: "/farmers" },
      { label: "Partners", href: "/partners" },
      { label: "Insights", href: "/insights" },
    ],
  },
  {
    title: "Experience",
    links: [
      { label: "Product Demo", href: "/product" },
      { label: "3D Experience", href: "/journey" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact VAN", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <div className={styles.footerBrand}>
          <Logo />
          <p className={styles.footerTagline}>
            Helping farmers, from soil to sale.
          </p>
          <p className={styles.footerNote}>
            VAN is building an integrated agricultural operating company.
            All demonstration content is illustrative and for informational purposes only.
          </p>
        </div>

        <div className={styles.footerLinks}>
          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className={styles.footerColumn}>
              <h4 className={styles.footerColumnTitle}>{group.title}</h4>
              <ul className={styles.footerColumnLinks}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={`container ${styles.footerBottom}`}>
        <p className={styles.footerCopyright}>
          &copy; {new Date().getFullYear()} VAN. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
