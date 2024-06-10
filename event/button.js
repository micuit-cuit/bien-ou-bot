const { Events } = require('discord.js');
const database = require('../src/db');
const path = require('path');
const DATABASE = new database(path.join(__dirname, "../db"));
const dbVote = DATABASE.load("custom-buttons-votes");
dbVote.saveData();
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
				//verifie si l'utilisateur a déjà voté
				const message = interaction.message.id;
				const user = interaction.user.id;
				let userVote = dbVote.search({ "messageId": message});
				if (userVote.length == 0) {
					dbVote.add({ "messageId": message, "votes": []});
					userVote = dbVote.search({ "messageId": message});
				}
				if (userVote[0].votes.includes(user)) {
					await interaction.reply({ 
						content: `Vous avez déjà voté pour ce message`,
						ephemeral: true
					});
					return;
				}
				//ajoute l'utilisateur au vote
				let userVoteUpdate = userVote[0].votes
				userVoteUpdate.push(user);
				dbVote.update({ "messageId": message }, { "votes": userVoteUpdate });
				
				//ajoute 1 au conteur
				//update le message
				let components = interaction.message.components[0].components[0];
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
				return;
			}
			await interaction.reply({ 
				content: `le système de vote et de liaison discord>bob n'est pas encore implémenté et est prévu pour dans le futur. Merci de votre compréhension`,
				ephemeral: true
			});
		}
	}

};