const {  ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const database = require('../src/db');
const path = require('path');
const DATABASE = new database(path.join(__dirname, "../db"));
const dbVote = DATABASE.load("custom-buttons-votes");
const dbUser = DATABASE.load("users");

dbVote.saveData();
module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(client, interaction) {
		// if (!interaction.isChatInputCommand()) return;

		console.log(` ${interaction.user.tag} in #${interaction.channel.name} triggered an interaction: `,interaction.customId);
		if (!interaction.isButton()) return;
		if (interaction.customId.startsWith('moods')) {
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
					}).catch(console.error);
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
									custom_id: 'moods--demo'
								}
							]
						}
					]
				}).catch(console.error);
				return;
			}
			await interaction.reply({ 
				content: `le système de vote et de liaison discord>bob n'est pas encore implémenté et est prévu pour dans le futur. Merci de votre compréhension`,
				ephemeral: true
			}).catch(console.error);
		}
		if (interaction.customId === 'login') {
			//verifie si l'utilisateur est déjà connecté
			const user = interaction.user.id;
			let userExist = dbUser.search({ "discordId": user});
			if (userExist.length !== 0) {
				const embed = new EmbedBuilder()
					.setTitle("erreur")
					.setDescription("vous êtes déjà connecté")
					.setColor("#ff0000");
				await interaction.reply({ embeds: [embed] , ephemeral: true}).catch(console.error);
				return;
			}
			const modal = new ModalBuilder()
				.setCustomId('loginModal')
				.setTitle('Page de connexion')
				const email = new TextInputBuilder()
				.setCustomId('email')
				// The label is the prompt the user sees for this input
				.setLabel("Veuillez entrer votre email")
				// Short means only a single line of text
				.setStyle(TextInputStyle.Short);
	
			const password = new TextInputBuilder()
				.setCustomId('password')
				.setLabel("Veuillez entrer votre mot de passe")
				// Paragraph means multiple lines of text.
				.setStyle(TextInputStyle.Short);

	
			// An action row only holds one text input,
			// so you need one action row per text input.
			const emailRow = new ActionRowBuilder().addComponents(email);
			const passwordRow = new ActionRowBuilder().addComponents(password);
	
			// Add inputs to the modal
			modal.addComponents(emailRow, passwordRow);
			await interaction.showModal(modal).catch(console.error);
		}
		
	}

};