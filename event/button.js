const {  ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const database = require('../src/db');
const path = require('path');
const { tempLogin, voteMood } = require('../src/bobAPI');
const crypto = require('crypto');

const DATABASE = new database(path.join(__dirname, "../db"));
const dbVoteDemo = DATABASE.load("custom-buttons-votes");
const dbUser = DATABASE.load("users");

dbVoteDemo.saveData();
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
				let userVote = dbVoteDemo.search({ "messageId": message});
				if (userVote.length == 0) {
					dbVoteDemo.add({ "messageId": message, "votes": []});
					userVote = dbVoteDemo.search({ "messageId": message});
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
				dbVoteDemo.update({ "messageId": message }, { "votes": userVoteUpdate });
				
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
			const moodID = id;

			//verifie si l'utilisateur est déjà connecté
			const user = interaction.user.id;
			let userExist = dbUser.search({ "userID": user});
			if (userExist.length === 0) {
				const embed = new EmbedBuilder()
					.setTitle("erreur")
					.setDescription("vous n'êtes pas connecté, faites /login pour vous connecter")
					.setColor("#ff0000");
				await interaction.reply({ embeds: [embed] , ephemeral: true}).catch(console.error);
				return;
			}

			//verifie si le conte de l'utilisateur marche et conete le.
			//decrypte le mot de passe
			const salt = process.env.SALT;
			const email = userExist[0].email;
			const iv = Buffer.from(userExist[0].passwordEncrypted.split(':')[0], 'hex');
			const encrypted = userExist[0].passwordEncrypted.split(':')[1];
			const key = crypto.scryptSync(email + salt, 'salt', 32); // Génère une clé de 32 bytes
			const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
			let decrypted = decipher.update(encrypted, 'hex', 'utf8');
			const password = decrypted;
			//login l'utilisateur
			tempLogin(email, password, async (token) => {
				//test si la connexion a echoué et envoie un message d'erreur
				if (!token) {
					const embed = new EmbedBuilder()
						.setTitle("erreur")
						.setDescription("connexion echoué, verifier vos identifiants")
						.setColor("#ff0000");
					interaction.reply({ embeds: [embed] , ephemeral: true}).catch(console.error);
					return;
				}
				//verifie si l'utilisateur a déjà voté
				if (userExist[0].votes.includes(moodID)) {
					//supprime le vote de l'utilisateur
					voteMood(moodID, "cNY0t40BBT2uGxRqaH3l", "unvote", token ,async (data) => {
						//test si une erreur est survenue
						if (data.error != undefined) {
							const embed = new EmbedBuilder()
								.setTitle("erreur")
								.setDescription("une erreur est survenue lors de la suppression de votre vote")
								.setColor("#ff0000");
							await interaction.reply({ embeds: [embed] , ephemeral: true}).catch(console.error);
							console.log(data);
							return;
						}
						//supprime le vote de l'utilisateur de la base de donnée
						let userVoteUpdate = userExist[0].votes.filter((vote) => vote !== moodID);
						dbUser.update({ "userID": user }, { "votes": userVoteUpdate });
						//enleve 1 au conteur et update le message, envoie un message de confirmation
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
											label: '×' + (parseInt(vote) - 1),
											custom_id: 'moods--' + moodID
										}
									]
								}
							]
						}).catch(console.error);
						const channel = interaction.channel;
						//envoie un message de confirmation
						const embed = new EmbedBuilder()
							.setTitle("vote supprimé")
							.setDescription("votre vote a bien été supprimé")
							.setColor("#f9c405");
						const replyMsg = await channel.send({ embeds: [embed], content: "<@" + user + ">",ephemeral: true}).catch(console.error);
						setTimeout(() => {
							replyMsg.delete();
						}, 5000);					
						return;
				});
				}else{
					//ajoute l'utilisateur au vote
					let userVoteUpdate = userExist[0].votes
					userVoteUpdate.push(moodID);
					//ajoute le vote
					voteMood(moodID, "cNY0t40BBT2uGxRqaH3l", "vote", token ,async (data) => {
						if (data.error != undefined) {
							const embed = new EmbedBuilder()
								.setTitle("erreur")
								.setDescription("une erreur est survenue lors de l'ajout de votre vote")
								.setColor("#ff0000");
							await interaction.reply({ embeds: [embed] , ephemeral: true}).catch(console.error);
							console.log(data);
							return;
						}
						//ajoute le vote de l'utilisateur a la base de donnée
						dbUser.update({ "userID": user }, { "votes": userVoteUpdate });
						//ajoute 1 au conteur et update le message, envoie un message de confirmation
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
											custom_id: 'moods--' + moodID
										}
									]
								}
							]
						}).catch(console.error);
						const channel = interaction.channel;
						//envoie un message de confirmation
						const embed = new EmbedBuilder()
							.setTitle("vote ajouté")
							.setDescription("votre vote a bien été ajouté")
							.setColor("#f9c405");
						const replyMsg = await channel.send({ embeds: [embed], content: "<@" + user + ">",ephemeral: true}).catch(console.error);
						setTimeout(() => {
							replyMsg.delete();
						}, 5000);
					});
				}
			});
			
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
		if (interaction.customId === 'deleteAccount') {
			const user = interaction.user.id;
			let userExist = dbUser.search({ "userID": user});
			if (userExist.length === 0) {
				const embed = new EmbedBuilder()
					.setTitle("erreur")
					.setDescription("vous n'êtes pas connecté")
					.setColor("#ff0000");
				await interaction.reply({ embeds: [embed] , ephemeral: true}).catch(console.error);
				return;
			}
			const embed = new EmbedBuilder()
				.setTitle("vérfication de suppression")
				.setDescription("attention, cette action est irréversible. Êtes-vous sûr de vouloir supprimer votre compte ? (" + userExist[0].email + ")")
				.setColor("#ff0000");
			const confirm = {
				type: 1,
				components: [
					{
						type: 2,
						style: 4,
						label: "confirmer",
						custom_id: "confirmDelete"
					}
				]
			}
			await interaction.reply({ embeds: [embed], components: [confirm] , ephemeral: true}).catch(console.error);
		}
		if (interaction.customId === 'confirmDelete') {
			const user = interaction.user.id;
			let userExist = dbUser.search({ "userID": user});
			if (userExist.length === 0) {
				const embed = new EmbedBuilder()
					.setTitle("erreur")
					.setDescription("vous n'êtes pas connecté")
					.setColor("#ff0000");
				await interaction.reply({ embeds: [embed] , ephemeral: true}).catch(console.error);
				return;
			}
			dbUser.remove({ "userID": user});
			const embed = new EmbedBuilder()
				.setTitle("compte supprimé")
				.setDescription("votre compte a bien été supprimé")
				.setColor("#ff0000");
			await interaction.reply({ embeds: [embed] , ephemeral: true}).catch(console.error);
		}
	}

};