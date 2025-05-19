'use client'
import styles from "./figureSection.module.css";

export default function FiguretSection() {

    return (
        <div className={`${styles.container}`}>
            <h2 className={styles.header}>
                Домик на
            </h2>
            <h2 className={styles.header}>
                дереве — это
            </h2>
            <div className={styles.figure_element}>
                <img
                    src="img/figure_envelope.png"
                    alt="figure 1"
                    className={styles.figure_img}
                />
                <p className={styles.figure_text}>Театральная студия</p>
            </div>
            <div className={styles.figure_element}>
                <img
                    src="img/figure_round.png"
                    alt="figure 2"
                    className={styles.figure_img}
                />
                <p className={styles.figure_text}>Пространство для праздников</p>
            </div>
            <div className={styles.figure_element}>
                <img
                    src="img/figure_star.png"
                    alt="figure 3"
                    className={styles.figure_img}
                />
                <p className={styles.figure_text}>Творческие мастер-классы</p>
            </div>
        </div>
    );
}
