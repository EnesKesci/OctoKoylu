export function formatTime(value: string | null) {
    if (!value) return ''

    return new Date(value).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
    })
}