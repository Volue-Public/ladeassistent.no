export type AdviceGraphPrice = {
    time: string
    price: number
}

export type PriceTimeRangeAdviceType =
    | 'Now'
    | 'Best'
    | 'Good'
    | 'Avoid'
    | 'Worst'
    | 'Unknown'

export type PriceTimeRangeAdvice = {
    from: string
    to: string
    type: PriceTimeRangeAdviceType
    cost: number
}

export type LegendTranslation = { [key in AdviceSegmentType]?: string }

export type AdviceSegmentType =
    | 'Now'
    | 'Best'
    | 'Good'
    | 'Avoid'
    | 'Worst'
    | 'Unknown'
