import React from 'react'

import Moon from './Moon'
import Sunrise from './Sunrise'
import Sun from './Sun'
import Sunset from './Sunset'
import Star from './Star'

type IconNames = 'moon' | 'sunrise' | 'sun' | 'sunset' | 'star'

function iconProvider(name: IconNames) {
    switch (name) {
        case 'moon':
            return <Moon />
        case 'sunrise':
            return <Sunrise />
        case 'sun':
            return <Sun />
        case 'sunset':
            return <Sunset />
        case 'star':
            return <Star />
        default:
            return <></>
    }
}

export type IconProps = {
    name: IconNames
    width?: number
    height?: number
}

export default function Icon({ name, width = 20, height = 20 }: IconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {iconProvider(name)}
        </svg>
    )
}
