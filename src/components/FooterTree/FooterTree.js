import styles from "./FooterTree.module.css";
import Image from "next/image";

export default function FooterTree() {
    return (
        <div className={styles.footer_tree}>
            <div className={styles.footer_tree_header}>
                <p className={styles.footer_tree_header_line_1}>
                    ДОМИК
                </p>
                <p className={styles.footer_tree_header_line_2}>
                    НА ДЕРЕВЕ
                </p>
            </div>
            {/* <Image
                className={styles.tree_img}
                src="/img/footer_tree.svg"
                alt="Трава"
                width={0}
                height={0}
                priority
            />
            <Image
                className={styles.girl_img}
                src="/img/footer_girl.svg"
                alt="Трава"
                width={100}
                height={200}
                priority
            /> */}
            <Image
                className={styles.tree_and_girl_img}
                src="/img/tree_and_girl.svg"
                alt="Трава"
                width={0}
                height={0}
                priority
            />
            <div className={styles.grass}>
                <Image
                    className={styles.grass_img}
                    src="/img/footer_grass.svg"
                    alt="Трава"
                    width={0}
                    height={0}
                    priority
                />
            </div>
        </div>
    );
}
