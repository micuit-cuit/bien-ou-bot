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
    const statsMessage = await statsChannel.messages.fetch(statsMessageID);

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

                statsMessage.edit({ embeds: [embed], files: [attachment], content: " " }) // Remarquez que content est mis à " "
                    .catch(console.error);
            })
};


    
