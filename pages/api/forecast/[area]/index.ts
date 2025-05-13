import {
    PLATFORM_API_URL,
    getOrRefreshAccessToken,
} from '@/src/api/platform-client'
import { ForecastSegment, PriceArea, PriceUnit } from '@/src/api/types'
import { isPriceArea } from '@/src/utils/priceArea.helper'
import { NextApiRequest, NextApiResponse } from 'next'

export type ForecastDTO = {
    priceArea: PriceArea
    priceUnit: PriceUnit
    forecastSegments: ForecastSegment[]
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ForecastDTO | { message: string }>
) {
    const { area, currency, energyUnit, vatRate } = req.query

    const token = await getOrRefreshAccessToken()
    if (token === null) {
        res.status(500).json({
            message:
                'There was an error with the response from the external API.',
        })
        return
    }

    if (typeof area != 'string' || !isPriceArea(area)) {
        res.status(400).json({ message: 'Invalid price area: ' + area })
        return
    }

    const encodedArea = encodeURIComponent(area)
    const url = new URL(
        `${PLATFORM_API_URL}/smart/v1/prices/actual/${encodedArea}`
    )
    url.searchParams.append('Currency', encodeURIComponent(String(currency)))
    url.searchParams.append(
        'EnergyUnit',
        encodeURIComponent(String(energyUnit))
    )
    url.searchParams.append('VATRate', encodeURIComponent(String(vatRate)))

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token.token.access_token}`,
        },
    })

    if (!(response.status === 200)) {
        res.status(response.status).json({
            message:
                'There was en error with the response from one or more external API(s).',
        })
    }

    const data = (await response.json()) as ForecastDTO

    res.status(200).json(data)
}
