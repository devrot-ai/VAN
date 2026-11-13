/**
 * VAN Product — Layout
 *
 * Wraps the product dashboard with sidebar navigation and top bar.
 */

import { ProductProvider } from "@/lib/product/ProductState";
import ProductSidebar from "@/components/product/ProductSidebar";
import styles from "@/components/product/ProductLayout.module.css";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <div className={styles.productLayout}>
        <ProductSidebar />
        <div className={styles.productMain}>
          <div className={styles.productTopBar}>
            <span className={styles.topBarTitle}>VAN Operations Platform</span>
            <div className={styles.topBarActions}>
              <span className={styles.demoNotice}>Illustrative Demo Data</span>
            </div>
          </div>
          <div className={styles.productContent}>
            {children}
          </div>
        </div>
      </div>
    </ProductProvider>
  );
}
