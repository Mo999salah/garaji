/**
 * Parses a workingHours string like "08:00-22:00" or "09:00-12:00,16:00-21:00"
 * and determines if the branch is currently open.
 */
export function isBranchOpen(workingHours?: string): { isOpen: boolean; label: string } {
  if (!workingHours) {
    return { isOpen: false, label: 'غير محدد' };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const ranges = workingHours.split(',').map((r) => r.trim());
  for (const range of ranges) {
    const parts = range.split('-');
    if (parts.length !== 2) continue;

    const [startStr, endStr] = parts;
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);

    if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) continue;

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    if (currentMinutes >= start && currentMinutes <= end) {
      return { isOpen: true, label: 'مفتوح الآن' };
    }
  }

  return { isOpen: false, label: 'مغلق' };
}
