/**
 * Utility function to combine class names
 * Supports strings, arrays, and conditional objects like clsx
 */
export function cn(...args: any[]): string {
    const classes: string[] = []

    for (const arg of args) {
        if (!arg) continue

        if (typeof arg === 'string') {
            classes.push(arg)
        } else if (Array.isArray(arg)) {
            const result = cn(...arg)
            if (result) classes.push(result)
        } else if (typeof arg === 'object') {
            for (const key in arg) {
                if (arg[key]) {
                    classes.push(key)
                }
            }
        }
    }

    return classes.join(' ')
}

export default cn 