'use client'

import styles from "./BasicButton.module.css";

export default function BasicButton({ text, color, background, width, fontSizeMin, fontSizeMax, handler }) {

    return (
        <button
            className={styles.basic_btn}
            onClick={handler ? handler : () => console.log('no handler')}
            style={{
                backgroundColor: background,
                color: color ? color : "#fff",
                width: width ? width : "100%",
                fontSize: `clamp(${fontSizeMin ? fontSizeMin : '0.875rem'}, 3vw, ${fontSizeMax ? fontSizeMax : '2rem'})`
            }}
        >
            <span
                style={{
                    color: color ? color : "#fff",
                    fontSize: `clamp(${fontSizeMin ? fontSizeMin : '0.875rem'}, 3vw, ${fontSizeMax ? fontSizeMax : '2rem'})`
                }}>{text}</span>
        </button >
    );
}
