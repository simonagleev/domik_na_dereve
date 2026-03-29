/**
 * Превью мероприятия: сначала image_path (загрузка с прода), иначе старый image_name в /img/shows/
 */
export function resolveEventImageSrc(row) {
  if (!row) return null;
  const path =
    typeof row.image_path === 'string'
      ? row.image_path.trim()
      : typeof row.ImagePath === 'string'
        ? row.ImagePath.trim()
        : '';
  if (path) return path;
  const name =
    typeof row.image_name === 'string'
      ? row.image_name.trim()
      : typeof row.ImageName === 'string'
        ? row.ImageName.trim()
        : '';
  if (name) return `/img/shows/${name}`;
  return null;
}
