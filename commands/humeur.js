const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const drawHumeur = require('../src/generateImage.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('humeur')
        .addStringOption(option =>
            option.setName('humeur')
                .setDescription('Votre humeur, happy, neutral, sad ou une url d\'image (mal suporter)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Votre message')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('vote')
                .setDescription('Votre vote')
                .setRequired(true))
        .setDescription('Affiche votre humeur'),
    async execute(interaction) {
        const msg = interaction.options.getString('message')
        const humeur = interaction.options.getString('humeur')
        const vote = interaction.options.getInteger('vote')
        const buffer = await drawHumeur(msg,humeur)
        if (buffer === "urlError") {
            await interaction.reply({ content: 'L\'url de l\'image n\'est pas valide', ephemeral: true });
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
                            custom_id: 'button1--demo'
                        }
                    ]
                }
            ]
        });
    }
};