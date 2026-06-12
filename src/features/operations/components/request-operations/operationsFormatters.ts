export function formatOperationsDate(iso: string) {
 return new Date(iso).toLocaleString('ar-SA', {
 dateStyle: 'medium',
 timeStyle: 'short',
 });
}

export function formatMoney(value: number) {
 return `${value.toLocaleString('ar-SA')} ر.س`;
}
