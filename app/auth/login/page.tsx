import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import styles from "../auth.module.css";

export const metadata = { title: "Sign in — VAN" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

  return (
    <>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to your VAN account.</p>
      {reset === "1" ? (
        <div className={styles.recoveryDone} role="status">
          <strong>Password updated.</strong> Sign in with your new password.
        </div>
      ) : null}
      <LoginForm />
      <p className={styles.switch}>
        New to VAN? <Link href="/auth/register">Create an account</Link>
      </p>
      <p className={styles.switch}>
        Forgot your password? <Link href="/auth/recovery">Reset it</Link>
      </p>
    </>
  );
}
