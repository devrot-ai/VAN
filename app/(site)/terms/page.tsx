import StaticHero from "@/components/site/StaticHero";
import Section from "@/components/ui/Section";
import styles from "../static.module.css";

export default function TermsPage() {
  return (
    <>
      <StaticHero
        eyebrow="Terms"
        title="Terms of service."
        lead="The plain-language terms that govern your use of VAN’s public website and platform."
      />
      <Section>
        <div className="container container--narrow">
          <div className={styles.legalBody}>
            <h2>1. Acceptance</h2>
            <p>
              By accessing VAN, you agree to these terms. If you do not agree, please do
              not use the service.
            </p>
            <h2>2. Early access</h2>
            <p>
              Early access is an invitation to try a product still in development. Features
              may change, and access may be limited, suspended or ended at our discretion
              as we build and launch.
            </p>
            <h2>3. Your account</h2>
            <p>
              You are responsible for keeping your credentials secure and for activity on
              your account. You must provide accurate information and you may not use the
              service unlawfully.
            </p>
            <h2>4. Content & data</h2>
            <p>
              You retain ownership of the data you put into VAN. You grant us the limited
              right to process that data to provide the service to you. Sample or demo
              records we provide are clearly marked and not real farm data.
            </p>
            <h2>5. No misuse</h2>
            <p>
              You may not attempt to access other users’ data, disrupt the service, or use
              it to misrepresent a farm, provider or transaction.
            </p>
            <h2>6. Disclaimers</h2>
            <p>
              VAN is provided “as is” without warranties. We work hard to be accurate, but
              we do not guarantee that every outcome — including yield estimates or market
              information — is correct. You remain responsible for the decisions you make.
            </p>
            <h2>7. Changes</h2>
            <p>
              We may update these terms and will post changes here. Significant changes will
              be communicated to active users.
            </p>
            <h2>8. Contact</h2>
            <p>
              Questions? Reach us at legal@van.farm.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
