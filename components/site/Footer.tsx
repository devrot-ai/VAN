import Link from "next/link";
import { Logo } from "./Header";
import styles from "./Site.module.css";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Farm intelligence", href: "/platform/farm-intelligence" },
      { label: "Machinery", href: "/platform/machinery" },
      { label: "Services & labour", href: "/platform/services" },
      { label: "Harvest & logistics", href: "/platform/harvest-logistics" },
      { label: "Finance & commerce", href: "/platform/finance-commerce" },
      { label: "Connected hardware", href: "/platform/connected-hardware" },
    ],
  },
  {
    title: "Who it’s for",
    links: [
      { label: "Independent farmers", href: "/for-farmers" },
      { label: "Equipment owners", href: "/for-providers" },
      { label: "Service providers", href: "/for-providers" },
      { label: "Cooperatives", href: "/for-cooperatives" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Early access", href: "/early-access" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Logo dark />
            <p className={styles.footerTagline}>
              The operating environment for modern farming.
            </p>
          </div>
          <div className={styles.footerCols}>
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className={styles.footerColTitle}>{col.title}</h3>
                <ul className={styles.footerLinks}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} VAN Technologies. All rights reserved.</p>
          <p className={styles.footerLegal}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
