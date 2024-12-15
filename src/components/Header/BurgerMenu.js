'use client'
import styles from "./Header.module.css";
import Link from "next/link";


export default function BurgerMenu() {
    function closeMenu(event) {
        const menuToggle = document.getElementById("menu-toggle");
        if (menuToggle && event.target.tagName === "A") {
            menuToggle.checked = false;
        }
    }
    return (
        <nav role="navigation" className={styles.nav_burgr}>
            <input type="checkbox" id="menu-toggle" className={styles.menuCheckbox} />
            <label htmlFor="menu-toggle" className={styles.menuToggleLabel}>
                <span className={styles.hamburger}></span>
                <span className={styles.hamburger}></span>
                <span className={styles.hamburger}></span>
            </label>

            <div className={styles.menu}>
                <div className={styles.menuContainer}>
                    <nav className={styles.menuMain}>
                        <Link href="/" onClick={closeMenu}>Главная </Link>
                        <Link href="/shows" onClick={closeMenu}>Спектакли</Link>
                        <Link href="/workshops" onClick={closeMenu}>Мастер-классы</Link>
                        <a href="#contacts" onClick={closeMenu}>Контакты</a>
                    </nav>
                </div>
            </div>
        </nav>
    );
}
