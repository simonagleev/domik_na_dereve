import Header from "@/components/Header/Header";
import styles from "./Birthdays.module.css";

export default function Birthdays() {
    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.birthdays} style={{ backgroundImage: "url('/img/birthdays_bg.webp')" }}>
                BIRTHDAYS
            </div>
        </div>
    );
}
