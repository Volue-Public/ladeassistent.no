import { format, parseISO } from 'date-fns'
import React from 'react'
import { PriceTimeRangeAdvice, PriceTimeRangeAdviceType } from '../types'

import style from './coin.module.css'

function getColorFromAdvice(advice?: PriceTimeRangeAdviceType) {
    switch (advice) {
        case 'Now':
            return style.now
        case 'Best':
            return style.optimal
        case 'Good':
            return style.optimal
        case 'Worst':
            return style.avoid
        case 'Avoid':
            return style.avoid
        default:
            return style.now
    }
}

export type CoinProps = {
    price: number
    priceUnit: string
    advice: PriceTimeRangeAdvice
    details: string
}

export default function Coin({ price, priceUnit, advice, details }: CoinProps) {
    return (
        <div className={`${style.wrapper} ${getColorFromAdvice(advice.type)}`}>
            <div className={style.container}>
                <h3 className={style.price}>
                    {price.toString()} {priceUnit}
                </h3>
                <p className={style.time}>
                    {format(parseISO(advice.from), 'HH:mm')} -{' '}
                    {format(parseISO(advice.to), 'HH:mm')}
                </p>
                <p className={style.details}>{details}</p>
            </div>
        </div>
    )
}
