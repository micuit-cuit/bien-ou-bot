const { Events } = require('discord.js');
const { run } = require('../src/update/init');
module.exports = {
	name: Events.ClientReady,
	once: false,
	async execute(client, interaction) {
		console.log(`Ready! Logged in as ${interaction.user.tag}`);
		run(client);
	},

};