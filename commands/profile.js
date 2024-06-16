const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../src/db');
const path = require('path');
const { tempLogin } = require('../src/bobAPI');
const DATABASE = new database(path.join(__dirname, "../db"));
const db = DATABASE.load("users");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Affiche votre profil Bob.'),
    async execute(interaction) {
        const userID = interaction.user.id;
        //check if the user is already in the database
        const user = db.search({ "userID": userID });
        if (user.length != 0) {
            const embed = new EmbedBuilder()
                .setTitle("profile")
                .setColor("#f9c405");
            const button = {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 4,
                        label: "supprimer mon compte du bot",
                        custom_id: "deleteAccount"
                    }
                ]
            }
            
            await interaction.reply({ embeds: [embed] , components: [button]})
        }else{
            interaction.reply("Vous n'êtes pas connecté à Bob. Utilisez la commande /login pour vous connecter.")
            .catch(console.error);
            return;
        }
    }

};