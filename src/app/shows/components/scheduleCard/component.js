'use client';

import styles from './scheduleCard.module.css';
import Image from 'next/image';
import PaymentButton from '@/components/PaymentButton/PaymentButton';
import { useShowsStore } from '@/store/showsStore';
import ScheduleModal from '../scheduleModal/component';
import { resolveEventImageSrc } from '@/lib/eventImage';

function legacyFallbackImageSrc(showId) {
  const n = Number(showId);
  const file =
    n === 1
      ? 'dari_vremeni.svg'
      : n === 3
        ? 'malchik.png'
        : n === 4
          ? 'karton_desire.jpg'
          : n === 5
            ? 'dondi.jpg'
            : n === 6
              ? 'harvest.jpg'
              : n === 7
                ? 'skazka.jpg'
                : n === 8
                  ? 'ldinka.jpg'
                  : n === 9
                    ? 'ny_zvezda.jpg'
                    : n === 10
                      ? 'nebilici.jpg'
                      : n === 11
                        ? 'gusenica.jpg'
                        : n === 12
                          ? 'zayac.jpg'
                          : 'snegurochka.jpg';
  return `/img/shows/${file}`;
}

export default function ScheduleCard({ data }) {
  const { isModalOpen, openModal, updatePickedShow } = useShowsStore();

  const handeOpenModal = () => {
    updatePickedShow(data || null);
    openModal();
  };

  const first = data?.schedules?.[0];
  const commentsRaw = first?.Comments;
  const commentsArray =
    commentsRaw && String(commentsRaw).trim()
      ? String(commentsRaw).split(/(?<=[.!?])\s+/)
      : null;

  const imageFromDb = resolveEventImageSrc({
    ImagePath: data?.image_path,
    ImageName: data?.image_name,
  });
  const imageSrc = imageFromDb || legacyFallbackImageSrc(data?.id);

  const ageVal = data?.age;
  const sid = Number(data?.id);
  const ageDisplay =
    ageVal != null && ageVal !== ''
      ? String(ageVal)
      : sid === 7
        ? '4'
        : sid === 8 || sid === 11
          ? '0'
          : '3';

  return (
    <div className={styles.card}>
      <div className={styles.card_info}>
        <div className={styles.card_info_text}>
          <h2
            className={`${styles.card_name} ${
              data?.name === 'Снегурочка' || data?.name === 'Малыш, потерявший фантазию'
                ? styles.card_name_long
                : ''
            }`}
          >
            {data?.name}
          </h2>
          <p className={styles.card_description}>
            {first?.Description ? first.Description : 'Описание'}
          </p>
          <p className={styles.card_description}>Приходите, пожалуйста, за 10 минут до начала спектакля</p>

          <p className={styles.card_description}>
            Возрастное ограничение: <b>{ageDisplay}</b>+
          </p>

          {commentsArray?.length ? (
            <div style={{ marginBottom: '10px' }}>
              {commentsArray[0] ? (
                <p className={styles.card_description} style={{ fontWeight: 700 }}>
                  {commentsArray[0]}
                </p>
              ) : null}
              {commentsArray[1] ? <p className={styles.card_description}>{commentsArray[1]}</p> : null}
            </div>
          ) : null}
          <p className={styles.price}>
            Цена билета: {first ? first.Price : '—'} рублей
          </p>
        </div>

        <PaymentButton type={'main'} handler={handeOpenModal} />
      </div>
      <div className={styles.card_image_container}>
        <Image
          className={styles.card_image}
          src={imageSrc}
          alt="show picture"
          width={700}
          height={600}
        />
      </div>
      {isModalOpen ? <ScheduleModal key={data?.id} /> : null}
    </div>
  );
}
