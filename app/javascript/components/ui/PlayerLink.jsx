export default function PlayerLink({ name, path, className = 'hover:text-blue-400 transition-colors' }) {
  if (!name) return null
  if (path)  return <a href={path} className={className}>{name}</a>
  return <span>{name}</span>
}
