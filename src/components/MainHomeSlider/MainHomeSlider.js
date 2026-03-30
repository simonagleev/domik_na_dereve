
'use client'
import MainHomeCard from "../MainHomeCard/MainHomeCard";
import styles from "./MainHomeSlider.module.css";
import { getSeasonIrkutskNow } from "@/utils/season";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const gradientMap = {
    spring: "linear-gradient(to right, rgba(103, 159, 191, 1), rgba(163, 184, 55, 1))",
    summer: "linear-gradient(to right, rgba(103, 159, 191, 1), rgba(185, 218, 52, 1))",
    autumn: "linear-gradient(to right, rgba(100, 59, 39, 1), rgba(204, 140, 58, 1))",
    winter: "linear-gradient(to right, #7E94B3, #907D93)",
};

const items = [
//     {
//     id: 1,
//     name: 'Летний лагерь',
//     header: 'Летний лагерь с домиком на дереве!',
//     text: 'Лето — время приключений, новых друзей и творчества',
//     buttonText: 'Летний лагерь',
//     link: 'camp'
// },
{
    id: 1,
    name: 'Спектакли',
    header: 'Творчество и эмоции в каждом моменте!',
    text: 'Театральные постановки и яркие праздники ждут вашего ребенка.',
    buttonText: 'Спектакли',
    link: 'shows'
},
{
    id: 2,
    name: 'Мастер классы',
    header: 'Творчество и эмоции в каждом моменте!',
    text: 'Увлекательные мастер-классы и яркие праздники ждут вашего ребенка.',
    buttonText: 'Мастер-классы',
    link: 'workshops'
}, {
    id: 3,
    name: 'Дни рождения',
    header: 'День Рождения в театре',
    text: 'уникальные программы для проведения дней рождения с театральными постановками и мастер-классами',
    buttonText: 'День Рождения',
    link: 'birthdays'
}, {
    id: 4,
    name: 'Творческие мастерские',
    header: 'Творческие мастерские',
    text: 'индивидуальный подход, уютное пространство и профессиональные педагоги, вдохновляющие детей раскрывать свои способности',
    buttonText: 'Записаться на занятие',
    link: 'creativeWorkshops'
},]

/** Клоны по краям: без них при переходе последний→первый анимация «прокручивает» все слайды подряд */
function buildExtendedSlides(list) {
    if (list.length <= 1) return list;
    return [list[list.length - 1], ...list, list[0]];
}

export default function MainHomeSlider() {
    const season = getSeasonIrkutskNow();

    const extendedSlides = useMemo(() => buildExtendedSlides(items), []);
    const slideCount = extendedSlides.length;
    const useInfiniteLoop = items.length > 1;

    const [activeIndex, setActiveIndex] = useState(() =>
        useInfiniteLoop ? 1 : 0
    );
    const [reduceMotion, setReduceMotion] = useState(false);
    /** Без анимации при «прыжке» с клона на настоящий слайд */
    const [instantMove, setInstantMove] = useState(false);
    const activeIndexRef = useRef(activeIndex);
    activeIndexRef.current = activeIndex;

    useEffect(() => {
        //Инклюзивная дичь для отключения анимаций, если у пользователя такая настройка в браузере включена
        const mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => setReduceMotion(mediaQueryList.matches);
        sync();
        mediaQueryList.addEventListener("change", sync);
        return () => mediaQueryList.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        if (!instantMove) return;
        const id = requestAnimationFrame(() => setInstantMove(false));
        return () => cancelAnimationFrame(id);
    }, [instantMove]);

    /* Без CSS-transition события transitionend нет — подменяем прыжок с клона вручную */
    useEffect(() => {
        if (!useInfiniteLoop || !reduceMotion) return;
        if (activeIndex === slideCount - 1) {
            setInstantMove(true);
            setActiveIndex(1);
        } else if (activeIndex === 0) {
            setInstantMove(true);
            setActiveIndex(items.length);
        }
    }, [activeIndex, reduceMotion, useInfiniteLoop, slideCount, items.length]);

    const handleTrackTransitionEnd = useCallback(
        (e) => {
            if (e.propertyName !== "transform") return;
            if (!useInfiniteLoop || instantMove) return;
            const prev = activeIndexRef.current;
            if (prev === slideCount - 1) {
                setInstantMove(true);
                setActiveIndex(1);
                return;
            }
            if (prev === 0) {
                setInstantMove(true);
                setActiveIndex(items.length);
            }
        },
        [useInfiniteLoop, instantMove, slideCount, items.length]
    );

    const nextSlide = useCallback(() => {
        if (!useInfiniteLoop) return;
        setActiveIndex((prev) => {
            if (prev === slideCount - 1) return 2;
            return prev + 1;
        });
    }, [useInfiniteLoop, slideCount]);

    const prevSlide = useCallback(() => {
        if (!useInfiniteLoop) return;
        setActiveIndex((prev) => {
            if (prev === 0) return items.length;
            return prev - 1;
        });
    }, [useInfiniteLoop, items.length]);

    const activeDotIndex =
        !useInfiniteLoop
            ? activeIndex
            : activeIndex === 0
              ? items.length - 1
              : activeIndex === slideCount - 1
                ? 0
                : activeIndex - 1;

    return (
        <div
            className={styles.container}
            role="region"
            aria-label="Анонсы разделов сайта"
        >
            <div className={styles.sliderRow}>
                <button
                    type="button"
                    className={`${styles.arrow} ${styles.arrowAttention}`}
                    style={{ ["--arrow-season-gradient"]: gradientMap[season] }}
                    onClick={prevSlide}
                    aria-label="Предыдущий слайд"
                >
                    <svg
                        className={styles.arrowIcon}
                        aria-hidden={true}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="currentColor"
                            d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"
                        />
                    </svg>
                </button>

                <div className={styles.slidesShell}>
                    <div className={styles.slidesViewport}>
                        <div
                            className={styles.slidesTrack}
                            onTransitionEnd={handleTrackTransitionEnd}
                            style={{
                                ["--slide-count"]: slideCount,
                                width: `${slideCount * 100}%`,
                                transform: `translateX(-${(activeIndex * 100) / slideCount}%)`,
                                transition:
                                    reduceMotion || instantMove
                                        ? "none"
                                        : "transform 0.45s cubic-bezier(0.33, 1, 0.68, 1)",
                            }}
                        >
                            {extendedSlides.map((e, index) => (
                                <div
                                    key={index === 0 ? `clone-${e.id}-tail` : index === slideCount - 1 ? `clone-${e.id}-head` : `${e.id}`}
                                    className={styles.cardWrapper}
                                    aria-hidden={index !== activeIndex}
                                >
                                    <MainHomeCard
                                        header={e.header}
                                        paragraph={e.text}
                                        buttonText={e.buttonText}
                                        colorBg={gradientMap[season]}
                                        link={e.link}
                                        suppressShadow
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className={`${styles.arrow} ${styles.arrowAttention}`}
                    style={{ ["--arrow-season-gradient"]: gradientMap[season] }}
                    onClick={nextSlide}
                    aria-label="Следующий слайд"
                >
                    <svg
                        className={styles.arrowIcon}
                        aria-hidden={true}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="currentColor"
                            d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                        />
                    </svg>
                </button>
            </div>

            <nav className={styles.dots} aria-label="Переключение слайдов">
                {items.map((e, index) => (
                    <button
                        key={e.id}
                        type="button"
                        className={`${styles.dot} ${index === activeDotIndex ? styles.dotActive : ""}`}
                        aria-label={`Слайд ${index + 1} из ${items.length}: ${e.name}`}
                        aria-current={index === activeDotIndex ? "true" : undefined}
                        onClick={() =>
                            setActiveIndex(useInfiniteLoop ? index + 1 : index)
                        }
                    />
                ))}
            </nav>
        </div>
    );
}