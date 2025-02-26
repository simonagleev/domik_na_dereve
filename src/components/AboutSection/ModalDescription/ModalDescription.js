'use client'
import styles from "./ModalDescription.module.css";
import { useDescriptionModatStore } from "@/store/descriptionModatStore";

export default function ModalDescription({ }) {
    const { isOpen, closeDescriptionModal, textNumber, text_1, text_2 } = useDescriptionModatStore();

    const handleClickOutside = (e) => {
        if (e.target.classList.contains(styles.modal_overlay)) {
            closeDescriptionModal();
        }
    };
    let text = null
    console.log('textNumber')
    console.log(textNumber)
    switch (textNumber) {
        case 1:
            text = text_1
            break;
        case 2:
            text = text_2
            break;
        // case 3:
        //     text = text_3
        //     break;
        // case 4:
        //     text = text_4
        //     break;
    }
    return (
        <div className={styles.modal_overlay} onClick={handleClickOutside} >
            <div className={styles.form_container}>
                {/* Кнопка крестик */}
                <button className={styles.close_button} onClick={closeDescriptionModal} aria-label="Закрыть форму">
                    &times;
                </button>

                {text.map(e => {return <p className={styles.text}>{e}</p>})}
            </div>
        </div>
    );
}
