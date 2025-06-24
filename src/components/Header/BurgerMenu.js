'use client'
import styles from "./Header.module.css";
import Link from "next/link";
import { getSeason } from "@/utils/season";

//Получаем сезон
const month = new Date().getMonth()
const season = getSeason(month)
const gradientMap = {
    spring: "linear-gradient(to bottom, rgba(103, 159, 191, 1), rgba(163, 184, 55, 1))",
    summer: "linear-gradient(to bottom, rgba(103, 159, 191, 1), rgba(185, 218, 52, 1))",
    autumn: "linear-gradient(to bottom, rgba(100, 59, 39, 1), rgba(204, 140, 58, 1))",
    winter: "linear-gradient(to bottom, #7E94B3, #907D93)",
};

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

            <div className={styles.menu} style={{ background: gradientMap[season] || "#907D93" }}>
                <div className={styles.menuContainer}>
                    <nav className={styles.menuMain}>
                        <Link href="/" onClick={closeMenu}>Главная </Link>
                        <Link href="/shows" onClick={closeMenu}>Спектакли</Link>
                        {/* <Link href="/camp" onClick={closeMenu}>Летний лагерь</Link> */}
                        <Link href="/workshops" onClick={closeMenu}>Мастер-классы</Link>
                        <Link href="/birthdays" onClick={closeMenu}>Дни рождения</Link>
                        <Link href="/creativeWorkshops" onClick={closeMenu}>Творческие мастерские</Link>
                        <a href="#contacts" onClick={closeMenu}>Контакты</a>
                    </nav>
                </div>
            </div>
        </nav>
    );
}
