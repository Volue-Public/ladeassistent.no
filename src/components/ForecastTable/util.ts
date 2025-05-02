import { isEqual, parseISO, startOfDay } from 'date-fns'
import { ForecastEntry } from '.'

export function prepareDataForTable(data: ForecastEntry[]) {
    const result: ForecastEntry[][] = []

    let compareDate: Date | null = null
    data.forEach((entry) => {
        const from = startOfDay(parseISO(entry.from))
        if (result.length === 0) {
            compareDate = from
            result.push([entry])
        } else {
            if (compareDate && isEqual(from, compareDate)) {
                result[result.length - 1].push(entry)
            } else {
                compareDate = from
                result.push([entry])
            }
        }
    })
    return result
}
