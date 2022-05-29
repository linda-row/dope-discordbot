import { sfetch } from "../../util/sfetch";
import { secrets } from "../../../secrets";
import { Constants } from "../../constants";
import { getDailyMarketStatsEmbed, getWeeklyMarketStatsEmbed, getMonthlyStatsEmbed } from "../../util/marketStatsEmbed";
import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ColorResolvable, CommandInteraction } from "discord.js";

const setContract = (type: string) => {
    return type == "Hustler" ? Constants.HUSTLER_CONTRACT : Constants.GEAR_CONTRACT;
}

export default {
    data: new SlashCommandBuilder()
        .setName("qx")
        .setDescription("Shows various Quixotic stats")
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand.setName("hustler")
                .setDescription("Shows Hustler stats")
                .addStringOption((option: SlashCommandStringOption) =>
                    option.setName("timeframe")
                        .setDescription("Timeframe to show stats of")
                        .setRequired(true)
                        .addChoices(
                            { name: "Daily", value: "daily" },
                            { name: "Weekly", value: "weekly" },
                            { name: "Monthly", value: "monthly" }
                        )))

        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand.setName("gear")
                .setDescription("Shows Gear stats")
                .addStringOption((option: SlashCommandStringOption) =>
                    option.setName("timeframe")
                        .setDescription("Specify the timeframe")
                        .setRequired(true)
                        .addChoices(
                            { name: "Daily", value: "daily" },
                            { name: "Weekly", value: "weekly" },
                            { name: "Monthly", value: "monthly" }
                        ))),
    async execute(interaction: CommandInteraction): Promise<void> {
        const fnMap: any = {
            "hustler": getHustlerStats,
            "gear": getGearStats
        }

        await fnMap[interaction.options.getSubcommand()!](interaction, interaction.options.getString("timeframe"), interaction.options.getSubcommand()[0].toUpperCase() + interaction.options.getSubcommand().slice(1));
    }
};

const getHustlerStats = async (interaction: CommandInteraction, timeFrame: string, type: string): Promise<void> => {
    const qxHustlerStats = await sfetch(`${Constants.QX_API}/collection/${Constants.HUSTLER_CONTRACT}/stats`, { headers: { "X-API-KEY": secrets.quixoticApiKey } });
    if (!qxHustlerStats) {
        return Promise.reject();
    }
    await chooseEmbed(interaction, timeFrame, qxHustlerStats, type);
}

const getGearStats = async (interaction: CommandInteraction, timeFrame: string, type: string): Promise<void> => {
    const qxGearStats = await sfetch(`${Constants.QX_API}/collection/${Constants.GEAR_CONTRACT}/stats`, { headers: { "X-API-KEY": secrets.quixoticApiKey } });
    if (!qxGearStats) {
        return Promise.reject();
    }
    await chooseEmbed(interaction, timeFrame, qxGearStats, type);
}

const chooseEmbed = async (interaction: CommandInteraction, timeFrame: string, data: any, type: string): Promise<void> => {
    const embedToSend: any = {
        "daily": sendDailyStatsEmbed,
        "weekly": sendWeeklyStatsEmbed,
        "monthly": sendMonthlyStatsEmbed
    }

    await embedToSend[timeFrame](interaction, data, type)
}


const sendDailyStatsEmbed = async (interaction: CommandInteraction, qxHustlerStats: any, type: string): Promise<void> => {
    const dailyStatsEmbed = getDailyMarketStatsEmbed(qxHustlerStats.stats)
        .setTitle(`🔴✨ **Quixotic Stats** - ${type}`)
        .setURL(`${Constants.QX_LINK}/collection/${setContract(type)}`)
        .setColor(Constants.QX_RED as ColorResolvable)

    await interaction.reply({ embeds: [dailyStatsEmbed] });
}

const sendWeeklyStatsEmbed = async (interaction: CommandInteraction, qxHustlerStats: any, type: string): Promise<void> => {
    const weeklyStatsEmbed = getWeeklyMarketStatsEmbed(qxHustlerStats.stats)
        .setTitle(`🔴✨ **Quixotic Stats** - ${type}`)
        .setURL(`${Constants.QX_LINK}/collection/${setContract(type)}`)
        .setColor(Constants.QX_RED as ColorResolvable)

    await interaction.reply({ embeds: [weeklyStatsEmbed] });
}

const sendMonthlyStatsEmbed = async (interaction: CommandInteraction, qxHustlerStats: any, type: string): Promise<void> => {
    const monthlyStatsEmbed = getMonthlyStatsEmbed(qxHustlerStats.stats)
        .setTitle(`🔴✨ **Quixotic Stats** - ${type}`)
        .setURL(`${Constants.QX_LINK}/collection/${setContract(type)}`)
        .setColor(Constants.QX_RED as ColorResolvable)

    await interaction.reply({ embeds: [monthlyStatsEmbed] });
}
