import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Bar } from '@visx/shape'
import { Group } from '@visx/group'
import { scaleBand, scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { Text } from '@visx/text'
import { LegendItem, LegendLabel } from '@visx/legend'

import style from './advice-graph.module.css'
import useSize from '@react-hook/size'
import {
    LegendTranslation,
    AdviceGraphPrice,
    PriceTimeRangeAdvice,
    PriceTimeRangeAdviceType,
} from '../types'
import {
    format,
    isEqual,
    isWithinInterval,
    parseISO,
    startOfDay,
} from 'date-fns'

const marginTop = 90
const marginBottom = 16
const horizontalMargin = 60
const PADDING = 16

export type AdviceGraphProps = {
    initialWidth?: number
    initialHeight?: number
    data: AdviceGraphPrice[]
    advice: PriceTimeRangeAdvice[]
    priceUnit: string
    energyUnit: string
    labels?: boolean
    timeFormat?: string
    legend?: LegendTranslation
    legendGlyphSize?: number
    daysLabel?: boolean
    daysLabelText?: {
        today: string
        tomorrow: string
    }
}

export default function AdviceGraph({
    initialWidth = 500,
    initialHeight = 400,
    data,
    advice,
    priceUnit,
    energyUnit,
    labels = true,
    timeFormat = 'HH',
    legend,
    legendGlyphSize = 12,
    daysLabel = true,
    daysLabelText,
}: AdviceGraphProps) {
    const containerRef = useRef(null)
    const [width, height] = useSize(containerRef, {
        initialWidth,
        initialHeight,
    })
    const [isMultipleDays, setMultipleDays] = useState(false)
    const [shouldRenderBothDaysLabels, setRenderBothDaysLabels] =
        useState(false)
    const [indexOfTomorrow, setIndexOfTomorrow] = useState(0)
    const xMax = width - horizontalMargin
    const yMax = height - marginBottom - marginTop - PADDING

    const xScale = useMemo(
        () =>
            scaleBand<string>({
                range: [0, xMax],
                round: true,
                domain: data.map((x) => x.time),
                paddingOuter: 0.3,
                paddingInner: 0.3,
            }),
        [xMax, data]
    )

    const yScale = useMemo(
        () =>
            scaleLinear<number>({
                range: [yMax, 0],
                round: true,
                domain: [0, Math.max(...data.map((x) => x.price)) + 0.5],
            }),
        [yMax, data]
    )

    const formatDate = (d: string) => {
        return format(parseISO(d), timeFormat?.length ? timeFormat : 'HH')
    }

    const formatPrice = (value: number) => {
        return (value * 100).toString()
    }

    const adviceIntervals = useMemo(() => {
        return advice?.map((a) => ({
            interval: {
                start: parseISO(a.from),
                end: parseISO(a.to),
            },
            cost: a.cost,
            adviceType: a.type,
        }))
    }, [advice])

    const adviceSet = useMemo(
        () => Array.from(new Set(advice.map((a) => a.type))),
        [advice]
    )

    const priceData = useMemo(() => {
        return data.map((p) => ({
            ...p,
            adviceType: adviceIntervals?.find((ai) =>
                isWithinInterval(parseISO(p.time), ai.interval)
            )?.adviceType,
        }))
    }, [data, adviceIntervals])

    useEffect(() => {
        if (data.length > 1) {
            const days = data.map((d) => parseISO(d.time))
            const firstDay = days[0]
            const nextDay = days
                .slice(1, -1)
                .find((d) => !isEqual(startOfDay(d), startOfDay(firstDay)))
            if (nextDay) {
                setMultipleDays(true)
                // TODO: tweak this, number is there to avoid rendered text overlapping
                setRenderBothDaysLabels(days.indexOf(nextDay) >= 5)
                setIndexOfTomorrow(days.indexOf(nextDay))
            } else {
                setMultipleDays(false)
            }
        } else setMultipleDays(false)
    }, [data])

    return (
        <div ref={containerRef} className={style.container}>
            <svg width="100%" height="100%">
                <rect opacity={0} />
                <Group left={horizontalMargin} top={marginTop}>
                    {priceData.map((d, idx) => {
                        const barWidth = xScale.bandwidth()
                        const barHeight = yMax - (yScale(d.price) ?? 0)
                        const barX = xScale(d.time)

                        const barY = yMax - barHeight
                        return (
                            <Bar
                                data-testid={`spark-elements__chart-bar-${idx}`}
                                key={`bar-${idx}`}
                                rx={4}
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                className={getBarStyle(d.adviceType)}
                            />
                        )
                    })}
                </Group>
                <Group left={horizontalMargin / 2 + PADDING} top={marginTop}>
                    {labels && (
                        <>
                            <AxisLeft
                                hideAxisLine
                                hideTicks
                                scale={yScale}
                                tickFormat={(v) => formatPrice(v.valueOf())}
                                numTicks={5}
                                tickValues={yScale
                                    .ticks()
                                    .filter((_t, i) => i > 0 && i % 2 === 0)}
                                tickLabelProps={() => {
                                    return {}
                                }}
                                axisClassName={style.axis}
                                tickClassName={style.axis__text}
                            />
                            <Text
                                dy={-marginTop + PADDING}
                                dx={-PADDING}
                                fontSize={10}
                                className={style.axis__text}
                            >
                                {`${priceUnit}/${energyUnit}`}
                            </Text>
                        </>
                    )}
                </Group>
                <Group left={horizontalMargin} top={yMax + marginTop}>
                    {labels && (
                        <AxisBottom
                            hideAxisLine
                            hideTicks
                            scale={xScale}
                            tickFormat={formatDate}
                            tickLabelProps={() => {
                                return {}
                            }}
                            tickTransform={'translate(-9, 8)'}
                            axisClassName={style.axis}
                            tickClassName={style.axis__text}
                        />
                    )}
                </Group>
                {daysLabel && isMultipleDays && (
                    <>
                        {shouldRenderBothDaysLabels && (
                            <Group
                                left={
                                    (xScale(data[0].time) ?? 0) +
                                    horizontalMargin
                                }
                                top={marginTop}
                            >
                                <Text>{daysLabelText?.today}</Text>
                            </Group>
                        )}
                        <Group
                            left={
                                (xScale(data[indexOfTomorrow].time) ?? 0) +
                                horizontalMargin
                            }
                            top={marginTop}
                        >
                            <Text>{daysLabelText?.tomorrow}</Text>
                        </Group>
                    </>
                )}
            </svg>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    // Align with graph
                    marginLeft: horizontalMargin,
                }}
            >
                {adviceSet.map((le, i) => (
                    <LegendItem key={`legend-quantile-${i}`} margin="0 24px">
                        <svg
                            width={legendGlyphSize}
                            height={legendGlyphSize}
                            style={{ margin: '2px 0' }}
                        >
                            <circle
                                className={getBarStyle(le)}
                                r={legendGlyphSize / 2}
                                cx={legendGlyphSize / 2}
                                cy={legendGlyphSize / 2}
                            />
                        </svg>
                        <LegendLabel align="left" margin="0 0 0 4px">
                            {legend ? legend[le] : le}
                        </LegendLabel>
                    </LegendItem>
                ))}
            </div>
        </div>
    )
}

function getBarStyle(adviceType?: PriceTimeRangeAdviceType) {
    switch (adviceType) {
        case 'Now':
            return style.bar__now
        case 'Best':
            return style.bar__optimal
        case 'Avoid':
            return style.bar__avoid
        case 'Worst':
            return style.bar__worst
        default:
            return style.bar
    }
}
