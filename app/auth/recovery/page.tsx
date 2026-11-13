import Link from "next/link";
import RecoveryForm from "@/components/auth/RecoveryForm";
import styles from "../auth.module.css";

export default function RecoveryPage() {
  return (
    <>
      <h1 className={styles.title}>Reset your password</h1>
      <p className={styles.subtitle}>
        Enter your email. If it matches an account, we’ll send a reset link.
      </p>
      <RecoveryForm />
      <p className={styles.switch}>
        Remembered it? <Link href="/auth/login">Back to sign in</Link>
      </p>
    </>
  );
}
