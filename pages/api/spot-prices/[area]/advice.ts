import {
    PLATFORM_API_URL,
    getOrRefreshAccessToken,
} from '@/src/api/platform-client'
import { Advice, SpotPrice, PriceArea, PriceUnit } from '@/src/api/types'
import { isPriceArea } from '@/src/utils/priceArea.helper'
import { NextApiRequest, NextApiResponse } from 'next'

export type SpotPriceAdviceDTO = {
    advice: Advice[]
    spotPrices: SpotPrice[]
    priceArea: PriceArea
    priceUnits: PriceUnit
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SpotPriceAdviceDTO | { message: string }>
) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' })
        return
    }

    const area = req.query.area as string

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
    const response = await fetch(
        `${PLATFORM_API_URL}/smart/v1/prices/actual/${encodedArea}/advice`,
        {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.token.access_token}`,
            },
            body: JSON.stringify(req.body),
        }
    )

    if (!(response.status === 200)) {
        res.status(response.status).json({
            message:
                'There was en error with the response from one or more external API(s).',
        })
    }

    const data = (await response.json()) as SpotPriceAdviceDTO

    res.status(200).json(data)
}
