const MS_PER_DAY = 86_400_000;

export function isMaintenanceDueSoon(
 nextDueAt: string | undefined,
 nowMs: number,
 withinDays = 30,
): boolean {
 if (!nextDueAt) {
 return false;
 }

 const dueAt = new Date(nextDueAt).getTime();
 if (Number.isNaN(dueAt)) {
 return false;
 }

 return dueAt - nowMs < withinDays * MS_PER_DAY;
}
