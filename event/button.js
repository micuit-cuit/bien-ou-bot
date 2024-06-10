const { Events } = require('discord.js');
module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(client, interaction) {
		// if (!interaction.isChatInputCommand()) return;

		console.log(` ${interaction.user.tag} in #${interaction.channel.name} triggered an interaction: `,interaction.customId);
		if (!interaction.isButton()) return;
		if (interaction.customId.startsWith('button1')) {
			const id = interaction.customId.split('--')[1];
			await interaction.reply({ 
				content: `le système de vote et de liaison discord>bob n'est pas encore implémenté et est prévu pour dans le futur. Merci de votre compréhension`,
				ephemeral: true
			});
		}
	},

};