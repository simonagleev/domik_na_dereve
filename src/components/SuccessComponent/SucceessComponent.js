import styles from "./SuccessComponent.module.css";

export default function SuccessComponent() {

    return (
        <div className={styles.wrapper}>
            <div class={styles.check_block}>
                <div class={styles.check_wrapper}>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <h3 className={styles.header}>Thank You</h3>
            <p className={styles.paragraph}>Have a great day!</p>
        </div>
    )


}