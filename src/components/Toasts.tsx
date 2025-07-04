import ToastItem from '../elements/Toast';
import useToastsStore from '../stores/useToastsStore';
import styles from './Toasts.module.css';

export default function Toasts() {
  const toasts = useToastsStore((state) => state.toasts);
  return (
    <div className={styles.toasts}>
      {toasts.map((toast) => (
        <ToastItem type={toast.type} content={toast.content} key={toast._id} />
      ))}
    </div>
  );
}
