import Section from "@/components/ui/Section";
import styles from "./insights.module.css";

const TOPICS = [
  { title: "Soil and land intelligence", count: "Coming soon" },
  { title: "Agricultural machinery", count: "Coming soon" },
  { title: "Farming operations", count: "Coming soon" },
  { title: "Agricultural infrastructure", count: "Coming soon" },
  { title: "Post-harvest handling", count: "Coming soon" },
  { title: "Storage and logistics", count: "Coming soon" },
  { title: "Agricultural technology", count: "Coming soon" },
];

export default function InsightsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className="eyebrow">Insights</span>
          <h1 className={styles.heroTitle}>
            Agriculture, technology and research.
          </h1>
          <p className={styles.heroLead}>
            VAN's editorial section for articles about soil science,
            agricultural machinery, farming operations, infrastructure and
            the technology that connects them.
          </p>
        </div>
      </section>

      <Section>
        <div className="container">
          <h2 className={styles.sectionTitle}>Topics</h2>
          <p className={styles.sectionLead}>
            We'll be publishing articles and research on the topics that
            matter most to agricultural operations.
          </p>
          <div className={styles.topicsGrid}>
            {TOPICS.map((topic) => (
              <div key={topic.title} className={styles.topicCard}>
                <h3 className={styles.topicTitle}>{topic.title}</h3>
                <span className={styles.topicCount}>{topic.count}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section variant="dark">
        <div className="container">
          <div className={styles.comingSoon}>
            <h2 className={styles.comingSoonTitle}>
              Articles coming soon
            </h2>
            <p className={styles.comingSoonText}>
              We're preparing our first articles on soil assessment methods,
              agricultural machinery selection, and the role of technology
              in connected farming operations.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
