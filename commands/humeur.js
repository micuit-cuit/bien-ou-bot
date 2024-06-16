const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const drawHumeur = require('../src/generateImage.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('humeur')
        .addStringOption(option =>
            option.setName('humeur')
                .setDescription('Votre humeur, happy, neutral, sad ou une url d\'image')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Votre message')
                .setRequired(true))
        .setDescription('Affiche votre humeur'),
    async execute(interaction) {
        const msg = interaction.options.getString('message')
        const humeur = interaction.options.getString('humeur')
        const vote = 0
        //limite les url a qwant, google, discord, imgur
        if (!humeur.match(/(happy|neutral|sad|https:\/\/s2.qwant.com|https:\/\/th.bing.com|https:\/\/cdn.discordapp.com|https:\/\/i.imgur.com)/)) {
            await interaction.reply({ content: 'L\'url de l\'image n\'est pas valide, vous devez utiliser des image sur un des sites suivants: qwant, bing, discord, imgur', ephemeral: true })
                .catch(console.error);
            return;
        }
        const buffer = await drawHumeur(msg,humeur)
        if (typeof buffer === 'string') {
            await interaction.reply({ content: 'L\'url de l\'image n\'est pas valide', ephemeral: true })
                .catch(console.error);
            return;
        }
        const attachment = new AttachmentBuilder(buffer, 'profile-image.png');
        await interaction.reply({
            files: [attachment],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 4,
                            emoji: {
                                name: '🩷'
                            },
                            label: '×'+vote,
                            custom_id: 'moods--demo'
                        }
                    ]
                }
            ]
        })
        .catch(console.error);
    }
};