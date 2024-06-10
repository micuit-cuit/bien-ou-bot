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
			if (id === 'demo') {
				//ajoute 1 au conteur
				//update le message
				let message = await interaction.fetchReply();
				let components = message.components;
				let vote = components.label.split('×')[1];
				await interaction.update({
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
									label: '×' + (parseInt(vote) + 1),
									custom_id: 'button1--demo'
								}
							]
						}
					]
				});
			}
			await interaction.reply({ 
				content: `le système de vote et de liaison discord>bob n'est pas encore implémenté et est prévu pour dans le futur. Merci de votre compréhension`,
				ephemeral: true
			});
		}
	}

};