import Link from "next/link";
import styles from "./auth.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.cardWrap}>
        <div className={styles.card}>
          <Link href="/" className={styles.logo} aria-label="VAN — home">
            <span className={styles.logoMark} aria-hidden="true" />
            <span className={styles.logoWord}>VAN</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
