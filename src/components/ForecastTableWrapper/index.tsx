import { ForecastAdviceDTO } from '@/pages/api/forecast/[area]/advice'
import ForecastTable from '../ForecastTable'
import { InfoText } from '../UI'
import { texts } from './texts'
import { useTranslation } from '@/i18n'

import style from './ForecastTableWrapper.module.css'

type ForecastTableWrapperProps = {
    data: ForecastAdviceDTO
}

export default function ForecastTableWrapper({
    data,
}: ForecastTableWrapperProps) {
    const { t } = useTranslation()

    return (
        <>
            {/* // TODO: remove this div */}
            <div className={style.container}>
                <ForecastTable
                    data={data.forecastAdvice.map((f) => ({
                        ...f,
                        averagePrice: f.averagePrice * 100,
                        type: f.type as any,
                    }))}
                />
            </div>
            <InfoText>{t(texts.infoText)}</InfoText>
        </>
    )
}
