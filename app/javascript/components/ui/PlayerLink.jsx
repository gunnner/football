import styles from './PlayerLink.module.css'

export default function PlayerLink({ name, path, className }) {
  if (!name) return null
  if (path)  return <a href={path} className={className ?? styles.link}>{name}</a>
  return <span>{name}</span>
}
