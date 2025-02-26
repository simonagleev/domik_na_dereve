import PaymentCard from "@/components/PaymentCard/PaymentCard";
import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Image from "next/image";
import Reviews from "@/components/Reviews/Reviews";
import News from "@/components/News/News";
import AboutSection from "@/components/AboutSection/AboutSection";

export default function Home() {

  return (
    <div className={styles.component}>
      {/* <Header /> */}
      <div className={styles.container}>
        <div className={styles.home} style={{ backgroundImage: "url('/img/main_bg_winter.webp')" }}>
          <h1 className={styles.header}>Домик <br /> на дереве</h1>
          <div className={styles.right}>
          </div>
        </div>
        <PaymentCard />
      </div>

      <div className={styles.content}>
        <div className={styles.content_container}>
          {/* About */}
          <h2 className={styles.content_header}>
            Домик на дереве — <br /><span className={styles.content_header_span}>это место, где</span>
          </h2>
          <div className={styles.about_container}>
            <div className={styles.about_card}>
              <div className={styles.about_number} style={{ color: 'rgba(108, 181, 106, 1)' }}>01</div>
              <h2 className={styles.about_card_header}>
                Рождается <span style={{ color: 'rgba(108, 181, 106, 1)' }}>творчество:</span>
              </h2>
              <p className={styles.about_card_text}>
                дети обучаются актерскому мастерству, участвуют в <br />
                спектаклях и развивают свои таланты в увлекательной<br />
                и поддерживающей атмосфере.
              </p>
            </div>

            <div className={styles.about_card}>
              <div className={styles.about_number} style={{ color: 'rgba(187, 215, 229, 1)' }}>02</div>
              <h2 className={styles.about_card_header}>
                Каждый чувствует себя <span style={{ color: 'rgba(187, 215, 229, 1)' }}>особенным:</span>
              </h2>
              <p className={styles.about_card_text}>
                индивидуальный подход, уютное пространство и <br />
                профессиональные педагоги, вдохновляющие<br />
                детей раскрывать свои способности.
              </p>
            </div>

            <div className={styles.about_card}>
              <div className={styles.about_number} style={{ color: 'rgba(255, 213, 205, 1)' }}>03</div>
              <h2 className={styles.about_card_header}>
                <span style={{ color: 'rgba(255, 213, 205, 1)' }}>Создаются</span> незабываемые праздники:
              </h2>
              <p className={styles.about_card_text}>
                уникальные программы для проведения дней<br />
                рождения с театральными постановками и<br />
                мастер-классами.
              </p>
            </div>

            <div className={styles.about_card}>
              <div className={styles.about_number} style={{ color: 'rgba(108, 181, 106, 1))' }}>04</div>
              <h2 className={styles.about_card_header}>
                Открываются новые <span style={{ color: 'rgba(108, 181, 106, 1)' }}>возможности:</span>
              </h2>
              <p className={styles.about_card_text}>
                мастер-классы по актерскому искусству,<br />
                сценической речи, рукоделию и другим<br />
                направлениям для детей разного возраста.
              </p>
            </div>
          </div>
          {/* <AboutSection /> */}

          {/* Buy */}
          <div className={styles.buy_container}>
            <div className={styles.buy_content} style={{ backgroundImage: "linear-gradient(rgba(104, 77, 56, 0.80), rgba(104, 77, 56, 0.46)), url('/img/buy_bg.png')" }}>
              <Image
                className={styles.buy_logo}
                src="/img/logo.svg"
                alt="Домик на дереве лого"
                width={150}
                height={43}
                priority
              />
              <h3 className={styles.buy_header}>
                Профессиональные<br /> педагоги, уютная атмосфера,<br /> участие в спектаклях
              </h3>
              {/* <button className={styles.buy_buy_btn}>
                Купить билеты
              </button> */}
            </div>
          </div>

          {/* WHY */}
          <div className={styles.why_container}>
            <div className={styles.why_left}>
              <h3 className={styles.why_heading}>
                Почему дети<br />
                и взрослые <span style={{ color: 'rgba(119, 171, 199, 1)' }}> выбирают<br /> наше пространство?</span>
              </h3>
              <p className={styles.why_text}>
                Наша театральная студия предлагает уютную<br />
                и безопасную атмосферу, где каждый ребенок<br />
                становится частью волшебного мира искусства.
              </p>
              <Image
                className={styles.why_img}
                src="/img/why_img.jpg"
                alt="Дети почему"
                width={377}
                height={279}
              // layout="intrinsic" // вызывало легаси ворнинг
              />
            </div>
            <div className={styles.why_right}>
              <div className={styles.why_card}>
                <div className={styles.why_card_number}>1</div>
                <div className={styles.why_card_text}>
                  Индивидуальный подход и внимание<br />
                  к каждому ребенку
                </div>
              </div>

              <div className={styles.why_card}>
                <div className={styles.why_card_number} style={{ color: 'rgba(255, 213, 205, 1)' }}>2</div>
                <div className={styles.why_card_text}>
                  Участие в спектаклях, конкурсах и<br /> фестивалях
                </div>
              </div>

              <div className={styles.why_card}>
                <div className={styles.why_card_number} style={{ color: 'rgba(187, 215, 229, 1)' }}>3</div>
                <div className={styles.why_card_text}>
                  Дружеская атмосфера, где ценят<br /> талант каждого
                </div>
              </div>

              <div className={styles.why_card}>
                <div className={styles.why_card_number}>4</div>
                <div className={styles.why_card_text}>
                  Возможность развивать важные навыки:<br />
                  уверенность, публичные выступления,<br />
                  командная работа
                </div>
              </div>
            </div>
          </div>

          {/* Атмосфера фото */}
          <div className={styles.atmosphere_container}>

            <div className={styles.atmosphere_left}>
              <h3 className={styles.atmosphere_heading}>Неповторимая атмосфера<br /> праздника в <span style={{ color: 'rgba(108, 181, 106, 1)' }}>нашем пространстве</span></h3>
              <div className={styles.atmosphere_left_card} style={{ backgroundImage: "url('/img/atmosphere_bg.jpg')" }}>
                <button className={styles.atmosphere_btn}>
                  <Image
                    className={styles.atmosphere_icon}
                    src="/img/photo_icon.svg"
                    alt="все фото"
                    width={34}
                    height={27}
                  />
                  <p className={styles.atmosphere_btn_text}>Смотреть все фото</p>
                </button>
              </div>
            </div>
            <div className={styles.atmosphere_right}>
              <div className={styles.atmosphere_right_first}>
                <Image
                  className={`${styles.atmosphere_right_top_img}, ${styles.atmosphere_right_img}`}
                  src="/img/princess.jpg"
                  alt="Принцесса с мальчиком"
                  width={322}
                  height={276}
                />
                <div className={styles.atmosphere_small_div} style={{ backgroundImage: 'linear-gradient(rgba(103, 159, 191, 1), rgba(163, 201, 220, 1))' }}>
                  Выступления
                </div>
                <div className={styles.atmosphere_small_div} style={{ backgroundColor: 'rgba(84, 166, 92, 1)' }}>
                  Общение
                </div>
                <Image
                  className={`${styles.atmosphere_right_bot_img}, ${styles.atmosphere_right_img}`}
                  src="/img/2kids.jpg"
                  alt="Два ребенка"
                  width={322}
                  height={450}
                />
              </div>

              <div className={styles.atmosphere_right_first}>
                <Image
                  className={`${styles.atmosphere_right_top_img}, ${styles.atmosphere_right_img}`}
                  src="/img/kids_chair.jpg"
                  alt="Фото дети"
                  width={320}
                  height={450}
                />
                <div className={styles.atmosphere_small_div} style={{ backgroundColor: 'rgba(253, 163, 163, 1)' }}>
                  Дни рождения
                </div>
                <Image
                  className={`${styles.atmosphere_right_top_img}, ${styles.atmosphere_right_img}`}
                  src="/img/room.jpg"
                  alt="все фото"
                  width={320}
                  height={316}
                />
              </div>

            </div>
          </div>
          {/* REVIEWS */}
          <Reviews />
          {/* NEWS */}
          <News />
        </div>
      </div>
    </div>
  );
}
