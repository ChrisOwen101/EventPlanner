import {
    useEpg,
    Epg,
    Layout,
    ChannelBox,
    ChannelLogo,
    Channel,
    ChannelItem,
} from '@nessprim/planby-pro'

export const CustomGroup = ({ channel }: ChannelItem) => {
    const { position, logo, title } = channel
    return (
        <ChannelBox {...position}>
            {title}
        </ChannelBox>
    )
}