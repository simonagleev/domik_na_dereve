// 'use client'
// import Image from "next/image";
// import styles from "./PaymentCard.module.css";
// import { getSeason } from "@/utils/season";

// //Получаем сезон
// const month = new Date().getMonth()
// const season = getSeason(month)
// const gradientMap = {
//     spring: "linear-gradient(to right, rgba(103, 159, 191, 1), rgba(163, 184, 55, 1))",
//     summer: "linear-gradient(to right, rgba(103, 159, 191, 1), rgba(185, 218, 52, 1))",
//     autumn: "linear-gradient(to right, rgba(100, 59, 39, 1), rgba(204, 140, 58, 1))",
//     winter: "linear-gradient(to right, #7E94B3, #907D93)",
// };

// export default function PaymentCard() {
//     return (
//         <div className={styles.card_container} >
//             <div className={styles.card_social_container}>
//                 <a href="https://www.vk.com" target="_blank" rel="noopener noreferrer">
//                     <Image
//                         className={styles.image}
//                         src="/img/vk_icon.svg"
//                         alt="ВК"
//                         width={45}
//                         height={45}
//                     />
//                 </a>
//                 <a href="https://www.telegram.com" target="_blank" rel="noopener noreferrer">
//                     <Image
//                         className={styles.image}
//                         src="/img/telegram_icon.svg"
//                         alt="Телеграм"
//                         width={45}
//                         height={45}
//                     />
//                 </a>
//             </div>
//             <h2 className={styles.card_header}>
//                 Творчество и <span className={styles.color_word}>эмоции </span> <br/>
//                 в каждом моменте!
//             </h2>
//             <p className={styles.card_text}>
//                 Театральные постановки, увлекательные <br /> мастер-классы и яркие праздники ждут<br /> вашего ребенка.
//             </p>
//             <div className={styles.wrapper}>
//                 <a className={styles.button} href="#">Купить билеты</a>
//             </div>
//             <svg style={{ visibility: "hidden", position: "absolute" }} width="0" height="0" xmlns="http://www.w3.org/2000/svg" version="1.1">
//                 <defs>
//                     <filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
//                         <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
//                         <feComposite in="SourceGraphic" in2="goo" operator="atop" />
//                     </filter>
//                 </defs>
//             </svg>
//         </div>
//     );
// }
