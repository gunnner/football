import styles from './Skeleton.module.css'

export default function Skeleton({ className }) {
  return <div className={`${styles.skeleton}${className ? ` ${className}` : ''}`} />
}
