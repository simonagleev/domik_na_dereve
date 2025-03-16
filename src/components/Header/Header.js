import Image from "next/image";
import styles from "./Header.module.css";
import { getSeason } from "@/utils/season";
import Link from "next/link";
import BurgerMenu from "./BurgerMenu";

//Получаем сезон
const month = new Date().getMonth()
const season = getSeason(month)
const gradientMap = {
    spring: "linear-gradient(to right, rgba(103, 159, 191, 1), rgba(163, 184, 55, 1))",
    summer: "linear-gradient(to right, rgba(103, 159, 191, 1), rgba(185, 218, 52, 1))",
    autumn: "linear-gradient(to right, rgba(100, 59, 39, 1), rgba(204, 140, 58, 1))",
    winter: "linear-gradient(to right, #7E94B3, #907D93)",
};

export default function Header() {
    return (
        <header className={styles.header} style={{ background: gradientMap[season] || "transparent" }}>
            <Link href="/">
                <Image
                    className={styles.logo}
                    src="/img/logo.svg"
                    alt="Домик на дереве лого"
                    width={0}
                    height={0}
                    priority
                />
            </Link>
            <nav className={styles.nav} >
                <Link href="/shows">Спектакли</Link>
                <Link href="/workshops">Мастер-классы</Link>
                <Link href="/birthdays">Дни рождения</Link>
                <Link href="/creativeWorkshops">Творческие мастерские</Link>
                <a href="#contacts">Контакты</a>
            </nav>
            <div className={styles.phone}>
                <a href="tel: +79149322882"> +7 (914) 932‑28‑82</a>
            </div>
            <BurgerMenu />
        </header>
    );
}
