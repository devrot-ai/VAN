import Link from "next/link";
import ResetForm from "@/components/auth/ResetForm";
import styles from "../../auth.module.css";

export const metadata = { title: "Choose a new password — VAN" };

export default async function RecoveryResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <>
        <h1 className={styles.title}>Missing reset token</h1>
        <p className={styles.subtitle}>
          Open the reset link exactly as it was shared with you.
        </p>
        <p className={styles.switch}>
          <Link href="/auth/recovery">Request a new reset link</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.title}>Choose a new password</h1>
      <p className={styles.subtitle}>
        Single-use link — it expires one hour after it was requested.
      </p>
      <ResetForm token={token} />
      <p className={styles.switch}>
        <Link href="/auth/login">Back to sign in</Link>
      </p>
    </>
  );
}
