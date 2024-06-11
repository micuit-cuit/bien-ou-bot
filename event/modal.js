const { Events, EmbedBuilder } = require('discord.js');
const crypto = require('crypto');
const { tempLogin } = require('../src/bobAPI');
const database = require('../src/db');
const path = require('path');
const DATABASE = new database(path.join(__dirname, "../db"));
const dbUser = DATABASE.load("users");
dbUser.saveData();
module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(client, interaction) {
        //test si l'interaction est un modal
        if (!interaction.isModalSubmit()) return;
        console.log(` ${interaction.user.tag} in #${interaction.channel.name} triggered an interaction: `,interaction.customId);
        if (interaction.customId === 'loginModal') {
            const embed = new EmbedBuilder()
                .setTitle("tentative de connexion a votre compte bob")
                .setDescription("cela peut prendre plusieurs minute")
                .setColor("#f9c405");
        
            await interaction.reply({ embeds: [embed] }).catch(console.error);
            const email = interaction.fields.getTextInputValue('email');
            const password = interaction.fields.getTextInputValue('password');
            tempLogin(email,password,(token, data) => {
                //test si la connexion a echoué
                if (!token) {
                    //envoie un message d'erreur
                    const embed = new EmbedBuilder()
                        .setTitle("connexion echoué")
                        .setDescription("verifier vos identifiant")
                        .setColor("#ff0000");
                    interaction.editReply({ embeds: [embed] , ephemeral: true}).catch(console.error);
                    return;
                }
                try{
                    //encrypte le mot de passe
                    const salt = process.env.SALT;
                    const key = crypto.scryptSync(email + salt, 'salt', 32); // Génère une clé de 32 bytes
                    const iv = crypto.randomBytes(16); // Génère un IV de 16 bytes
                    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
                    let encrypted = cipher.update(password, 'utf8', 'hex');
                    encrypted += cipher.final('hex');
                    let passwordEncrypted = iv.toString('hex') + ':' + encrypted;
                    //ajoute l'utilisateur a la base de donnée
                    dbUser.add({ "userID": interaction.user.id, "email": email, "passwordEncrypted": passwordEncrypted});
                }catch(e){
                    //si une erreur survient
                    console.log(e);
                    const embed = new EmbedBuilder()
                        .setTitle("probleme de connexion")
                        .setDescription("une erreur est survenue lors de la connexion, veuillez réessayer")
                        .setColor("#ff0000");
                    interaction.editReply({ embeds: [embed] , ephemeral: true})
                        .catch(console.error);//on est jamais trop prudent avec discord.js
                    return;
                }
                const embed = new EmbedBuilder()
                    .setTitle("connexion reussi")
                    .setDescription("vous pouvez maintenant utiliser les fonctionnalité de bob dans discord. pour voir votre profil utilisez la commande /profile")
                    .setColor("#f9c405");
                interaction.editReply({ embeds: [embed], ephemeral: true})
                    .catch(console.error);
            });
        }

	},

};