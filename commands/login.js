const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../src/db');
const path = require('path');
const { login } = require('../src/bobAPI');
const DATABASE = new database(path.join(__dirname, "../db"));
const db = DATABASE.load("users");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Permet de synchroniser votre compte Bob.'),
    async execute(interaction) {
        const userID = interaction.user.id;
        //check if the user is already in the database
        const user = db.search({ "userID": userID });
        if (user.length != 0) {
            interaction.reply("Vous êtes déjà connecté à Bob. Utilisez la commande /profile pour voir votre profil.")
            .catch(console.error);
        }
        const embed = new EmbedBuilder()
            .setTitle("Synchroniser votre compte Bob")
            .setDescription("Pour synchroniser votre compte Bob, cliquez sur le bouton et entrez vos identifiants (nom d'email et mot de passe).\n\n**ATTENTION** : Comme le bot doit se connecter avec vos informations, celles-ci ne peuvent pas être **hachées**. elle sont donc stockées **chiffrées** dans la base de données. l'opération est donc reversible.")
            .setColor("#f9c405");

        await interaction.reply({ embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 4,
                            label: "login",
                            custom_id: "login"
                        }
                    ]
                }
            ]
        }).catch(console.error);
    }

};