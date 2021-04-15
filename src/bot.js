const discord = require('discord.js');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const dBot = process.env.BOT_TOKEN;
const ytKey = process.env.YT_KEY;
const ytChannelId = process.env.YT_CHANNEL_ID;
const DiscordChannelId = process.env.CHANNEL_ID
var currentId = null;
var textChannel = null;
const client = new discord.Client();

main();

function main() {
    client.login(dBot);
    client.on('ready', () => {
        appendDateToFile();
        textChannel = client.channels.cache.get(DiscordChannelId);
        currentId = getIDFromFile();
        doYoutubeStuff();
        setInterval(doYoutubeStuff, 1200000);
    });
    client.on('erorr', (error) => logError(error));
}

function writeVideoIDToFile(id) {
    fs.writeFileSync('latest_video_id.txt', id);
}

function appendDateToFile() {
    var startDate = getDate();
    fs.appendFileSync('log.txt', 'bot sucessfully started: ' + startDate + "\r\n");
}

function getIDFromFile() {
    id = fs.readFileSync('latest_video_id.txt').toString();
    return id;
}

function doYoutubeStuff() {
    getVideos().then((response => {
        var newId = response.items[0].id.videoId;
        if (newId !== currentId) {
            currentId = newId;
            writeVideoIDToFile(currentId);
            textChannel.send(createValidUrl(currentId));
            logToFile(currentId);
        } else {
            return;
        }
    }));
}

function logError(error){
    fs.appendFileSync("log.txt", getDate() + "error: " + error + "\r\n");
}
function logToFile(id) {
    fs.appendFileSync("log.txt", getDate() + ": new id found: " + id + "\r\n");
}

function createValidUrl(id) {
    return "https://www.youtube.com/watch?v=" + id;
}

function getVideos() {
    return axios.get("https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=" + ytChannelId + "&maxResults=1&order=date&key=" + ytKey)
    .then((response) => response.data).catch(error => {
        logError(error);
    });
}

function getDate() {
    return new Date().toISOString().
        replace(/T/, ' ').
        replace(/\..+/, '')
}