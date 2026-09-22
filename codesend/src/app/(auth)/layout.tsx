import { APP_NAME } from "@/lib/constants";
import styles from "./layout.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.screen}>
      <div className={styles.brand}>
        <div className={styles.wordmark}>{APP_NAME}</div>

        <div className={styles.brandBody}>
          <p className={styles.brandHeadline}>
            Share a snippet or a whole folder in one link.
          </p>

          <div className={styles.snippet} aria-hidden="true">
            <div className={styles.snippetLine}>
              <span className={styles.snippetDim}>$</span> codeshare push
              ./api
            </div>
            <div className={styles.snippetLine}>
              <span className={styles.snippetAccent}>✓</span> uploaded 14
              files
            </div>
            <div className={styles.snippetLine}>
              <span className={styles.snippetDim}>→</span> codeshare.dev/s/
              <span className={styles.snippetAccent}>x7k2m9</span>
            </div>
          </div>
        </div>

        <div className={styles.brandFoot}>
          © {new Date().getFullYear()} {APP_NAME}, Inc.
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formWrap}>
          <div className={styles.mobileWordmark}>{APP_NAME}</div>
          {children}
        </div>
      </div>
    </div>
  );
}
