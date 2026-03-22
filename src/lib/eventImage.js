/**
 * Превью мероприятия: сначала ImagePath (загрузка с прода), иначе старый ImageName в /img/shows/
 */
export function resolveEventImageSrc(row) {
  if (!row) return null;
  const path = typeof row.ImagePath === 'string' ? row.ImagePath.trim() : '';
  if (path) return path;
  const name = typeof row.ImageName === 'string' ? row.ImageName.trim() : '';
  if (name) return `/img/shows/${name}`;
  return null;
}
