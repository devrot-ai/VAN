import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
import styles from "../auth.module.css";

export default function RegisterPage() {
  return (
    <>
      <h1 className={styles.title}>Create your account</h1>
      <p className={styles.subtitle}>Set up VAN for your farm or business.</p>
      <RegisterForm />
      <p className={styles.switch}>
        Already have an account? <Link href="/auth/login">Sign in</Link>
      </p>
    </>
  );
}
