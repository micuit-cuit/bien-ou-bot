const { login, getMoods } = require('../bobAPI');
const sendMessageMood = require('../update/sendMessage');
const generateChart = require('../grafique/generator');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const database = require('../db');
const path = require('path');

const DATABASE = new database(path.join(__dirname, "../../db"));

const db = DATABASE.load("moods-stats");


module.exports.run = async (client) => {
    //login to bob API
    const username = process.env.USERNAME_BOB;
    const password = process.env.PASSWORD_BOB;
    const channelID = process.env.DISCORD_MOODS_CHANNEL;
    const channel = await client.channels.fetch(channelID);

    const statsChannelID = process.env.DISCORD_STATS_CHANNEL;
    const statsMessageID = process.env.DISCORD_STATS_MESSAGE;
    const statsChannel = await client.channels.fetch(statsChannelID);

    let statsMessage 
    try {
        statsMessage = await statsChannel.messages.fetch(statsMessageID);
    }
    catch (e) {
        statsMessage = undefined
    }
    //si le message n'existe pas ou n'est pas a nous
    if (statsMessage === undefined || statsMessage.author.id !== client.user.id) {
        statsMessage = await statsChannel.send("Initialisation du graphique");
        console.error("Le message de stats a été réinitialisé, veillez à mettre à jour le fichier .env, voila le nouvelle ID: "+statsMessage.id)
        process.exit(1)
    }
    login(username, password, async (token) => {
        //get moods from bob API
        getMoods(async (moods) => {
            displayMood(moods,channel,statsMessage);
        });
        setInterval(() => {
            getMoods(async (moods) => {
                displayMood(moods,channel,statsMessage);
            });
        }, 10 * 60 * 1000);//every 10 minutes   
    });
}
function displayMood(moods,channel,statsMessage) {
    const dateString = new Date().toISOString().split('T')[0] //get the date in the format YYYY-MM-DD

    const mood = moods.find(mood => mood.day === dateString);
    console.log(mood)
    sendMessageMood(mood.moods.happy.votedComments,dateString, "happy",channel);
    sendMessageMood(mood.moods.neutral.votedComments,dateString, "neutral",channel);
    sendMessageMood(mood.moods.sad.votedComments,dateString, "sad",channel);
    //update the stats in the database
    if (db.search({ "date": dateString }).length === 0) {
        db.add({ "date": dateString, "moods": {
            "happy": {
                "count": mood.moods.happy.count,
                "commentsCount": mood.moods.happy.comments.length,
                "totalVotes": mood.moods.happy.votedComments.reduce((acc, comment) => acc + comment.votes, 0)
            },
            "neutral": {
                "count": mood.moods.neutral.count,
                "commentsCount": mood.moods.neutral.comments.length,
                "totalVotes": mood.moods.neutral.votedComments.reduce((acc, comment) => acc + comment.votes, 0)
            },
            "sad": {
                "count": mood.moods.sad.count,
                "commentsCount": mood.moods.sad.comments.length,
                "totalVotes": mood.moods.sad.votedComments.reduce((acc, comment) => acc + comment.votes, 0)
            }
        } });
    }else{
        db.update({ "date": dateString }, { "moods": {
            "happy": {
                "count": mood.moods.happy.count,
                "commentsCount": mood.moods.happy.comments.length,
                "totalVotes": mood.moods.happy.votedComments.reduce((acc, comment) => acc + comment.votes, 0)
            },
            "neutral": {
                "count": mood.moods.neutral.count,
                "commentsCount": mood.moods.neutral.comments.length,
                "totalVotes": mood.moods.neutral.votedComments.reduce((acc, comment) => acc + comment.votes, 0)
            },
            "sad": {
                "count": mood.moods.sad.count,
                "commentsCount": mood.moods.sad.comments.length,
                "totalVotes": mood.moods.sad.votedComments.reduce((acc, comment) => acc + comment.votes, 0)
            }
        } });
    }

    //generate the chart
    generateChart(db.dir())
        .then((chart) => {
            const attachment = new AttachmentBuilder(chart, { name: `graph-${dateString}.png` });
            const embed = new EmbedBuilder()
                .setTitle("Tracker d'humeur")
                .setImage(`attachment://graph-${dateString}.png`)
                .setColor("#f9c405")
                .setFooter({
                    text: "il y a "+ mood.moods.happy.count + " personne hereuse"
                })
                .setTimestamp();
                try {
                    statsMessage.edit({ embeds: [embed], files: [attachment] }) // Remarquez que content est mis à " "
                }
                catch(e){
                    console.error("Impossible de mettre à jour le message de stats")
                }
            })
};


    
