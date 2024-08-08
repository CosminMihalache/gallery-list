
import styles from "@/styles/Card.module.css";

export default function Card({ id, imageUrl, title, checked, onChange, onClick, showCheckbox }) {
  return (
    <div className={styles.card} >
      <div className={styles.imageWrapper}>
        {showCheckbox && (
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className={styles.checkbox}
          />
        )}
        <img onClick={onClick} className={styles.cardImg} src={imageUrl} alt={title} />
      </div>
      <h2 className={styles.cardTitle}>{title}</h2>
    </div>
  );
}
