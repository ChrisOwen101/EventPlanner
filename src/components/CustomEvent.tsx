import {
    useEpg,
    Epg,
    Layout,
    ProgramBox,
    ProgramContent,
    ProgramFlex,
    ProgramStack,
    ProgramTitle,
    ProgramText,
    ProgramImage,
    useProgram,
    Program,
    ProgramItem
} from '@nessprim/planby-pro'
import { renderStartEndTime } from '../tools/TimeRenderer'

interface CustomEventProps extends ProgramItem {
    onEventClick: (id: string) => void
}

export const CustomEvent = ({ program, onEventClick, ...rest }: CustomEventProps) => {
    const { isLive, isMinWidth, styles, formatTime, set12HoursTimeFormat } =
        useProgram({
            program,
            ...rest,
        })

    const { data } = program
    const { image, title, since, till, id } = data

    return (
        <ProgramBox width={styles.width} style={styles.position} onClick={() => onEventClick(id)}>
            <ProgramContent width={styles.width} isLive={isLive}>
                <ProgramFlex>
                    {isLive && isMinWidth && <ProgramImage src={image} alt="Preview" />}
                    <ProgramStack>
                        <ProgramTitle>{title}</ProgramTitle>
                        <ProgramText>
                            {renderStartEndTime(since.toString(), till.toString())}
                        </ProgramText>
                    </ProgramStack>
                </ProgramFlex>
            </ProgramContent>
        </ProgramBox>
    )
}