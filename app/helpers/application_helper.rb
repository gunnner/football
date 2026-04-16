module ApplicationHelper
  def nav_link(text, path)
    active = current_page?(path)
    classes = active ? 'px-3 py-2 rounded-md text-sm font-medium text-white bg-gray-800'
                     : 'px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors'

    link_to text, path, class: classes
  end

  def event_icon(event_type)
    case event_type.to_s.downcase
    when 'goal'              then '⚽'
    when 'penalty'           then '⚽'
    when 'own goal'          then '🔴'
    when 'yellow card'       then '🟨'
    when 'red card'          then '🟥'
    when 'yellow-red card'   then '🟨 🟥'
    when 'substitution'      then '🔄'
    else '•'
    end
  end
end
