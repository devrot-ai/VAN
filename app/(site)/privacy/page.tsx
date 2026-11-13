import StaticHero from "@/components/site/StaticHero";
import Section from "@/components/ui/Section";
import styles from "../static.module.css";

export default function PrivacyPage() {
  return (
    <>
      <StaticHero
        eyebrow="Privacy"
        title="Your data is yours."
        lead="Last updated: this document. VAN is built on a simple promise: we collect only what we need, we are transparent about it, and you always stay in control."
      />
      <Section>
        <div className="container container--narrow">
          <div className={styles.legalBody}>
            <h2>1. What we collect</h2>
            <p>
              When you sign up for early access or contact us, we collect your name, email,
              and the role or business you tell us about. When you use the VAN platform, we
              store the records you create — fields, crops, bookings, jobs, finances and
              device data — so the product can function.
            </p>
            <h2>2. How we use it</h2>
            <ul>
              <li>To operate and improve the VAN platform you use.</li>
              <li>To contact you about early access and your account.</li>
              <li>To keep the service secure and prevent abuse.</li>
              <li>We do not sell your personal data. Ever.</li>
            </ul>
            <h2>3. Sharing</h2>
            <p>
              We only share data where you authorise it — for example, when you choose to
              connect with a provider, buyer or cooperative on the platform. Cooperatives
              only see member data that members have authorised. We do not share your data
              with third parties for their own marketing.
            </p>
            <h2>4. Security</h2>
            <p>
              Passwords are stored as salted hashes. We use secure, expiring sessions and
              server-side access controls, and we encrypt data in transit.
            </p>
            <h2>5. Your choices & rights</h2>
            <p>
              You can export, correct or delete your data, and you can close your account.
              To exercise any of these rights, contact us at support@van.farm.
            </p>
            <h2>6. Contact</h2>
            <p>
              Questions about this policy? Reach us at privacy@van.farm.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
