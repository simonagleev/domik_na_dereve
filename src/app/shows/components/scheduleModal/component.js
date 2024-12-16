'use client'
import styles from "./scheduleModal.module.css";
import { useShowsStore } from "@/store/showsStore";
import ItemCard from "./ItemCard";

export default function ScheduleModal({id }) {
    const pickedShow = useShowsStore((state) => state.pickedShow);
    const closeModal = useShowsStore((state) => state.closeModal);

    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modal_overlay)) {
            closeModal();
        }
    };

    return (
        <div className={styles.modal_overlay} onClick={handleClickOutside} key={id}>
            <div className={styles.form_container}>
                {/* Кнопка крестик */}
                <button className={styles.close_button} onClick={closeModal} aria-label="Закрыть форму">
                    &times;
                </button>
                {pickedShow.schedules.map((e, index) => {
                    return (
                        < ItemCard data={e} key={e.id || index}/>)
                })}
            </div>
        </div>
    );
}
