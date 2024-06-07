const { AttachmentBuilder } = require('discord.js');
const path = require('path');
const { login, getMoods } = require('../bobAPI');
const database = require('../db');
const drawHumeur = require('../generateImage');
const DATABASE = new database(path.join(__dirname, "../../db"));
const dateString = new Date().toISOString().split('T')[0] //get the date in the format YYYY-MM-DD

const db = DATABASE.load("comments--"+dateString);

module.exports.run = async (client) => {
    //login to bob API
    const username = process.env.USERNAME_BOB;
    const password = process.env.PASSWORD_BOB;
    const channelID = process.env.DISCORD_MOODS_CHANNEL;
    const channel = await client.channels.fetch(channelID);

    login(username, password, async (token) => {
        //get moods from bob API
        getMoods(async (moods) => {
            displayMood(moods,channel);
        });
        setInterval(() => {
            getMoods(async (moods) => {
                displayMood(moods,channel);
            });
        }, 10 * 60 * 1000);//every 10 minutes   
    });
}
function displayMood(moods,channel) {
    const mood = moods.find(mood => mood.day === dateString);
    console.log(mood)
    sendMessageMood(mood.moods.happy.votedComments,dateString, "happy",channel);
    sendMessageMood(mood.moods.neutral.votedComments,dateString, "neutral",channel);
    sendMessageMood(mood.moods.sad.votedComments,dateString, "sad",channel);
};
async function sendMessageMood(votedComments, dateString, type,channel) {
    console.log(votedComments)
    votedComments.forEach(async (comment) => {
        let verified = db.search({ "moodId": comment.moodId });
        if (verified.length === 0) {
            db.add({ "votes": comment.votes, "moodId": comment.moodId });
            const buffer = await drawHumeur(comment.text, type);
            const attachment = new AttachmentBuilder(buffer, 'profile-image.png');
            const msg = await channel.send({
                files: [attachment],
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
                                label: '×' + comment.votes,
                                custom_id: 'button1--' + comment.moodId
                            }
                        ]
                    }
                ]
            });
            db.update({ "moodId": comment.moodId }, { "messageId": msg.id });
        }else{
            const dbVote = db.search({ "moodId": comment.moodId })[0].votes;
            if(dbVote !== comment.votes){
                //update the button
                const buffer = await drawHumeur(comment.text, type);
                const attachment = new AttachmentBuilder(buffer, 'profile-image.png');
                const msg = await channel.messages.fetch(verified[0].messageId);
                await msg.edit({
                    files: [attachment],
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
                                    label: '×' + comment.votes,
                                    custom_id: 'button1--' + comment.moodId
                                }
                            ]
                        }
                    ]
                });
                db.update({ "moodId": comment.moodId }, { "votes": comment.votes });
            }
        }
    });
}

    
