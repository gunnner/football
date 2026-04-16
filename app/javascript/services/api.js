// Transforms JSON:API included array into a map: id → attributes, filtered by type
export function extractIncluded(included, type) {
  const map = {}
  included?.forEach(i => {
    if (i.type === type) map[i.id] = i.attributes
  })
  return map
}
