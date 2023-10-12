# midjourney zoom discord bot

A Discord bot built to integrate with the Midjourney image generation AI, allowing users to seamlessly join multiple zoom images together into a zoom video. 

## Installation and Setup

**Easy Way:**
- [Invite the bot to your server with this link](https://discord.com/api/oauth2/authorize?client_id=1124974800981475358&permissions=3072&scope=bot)

**Manual Setup:**
1. Get your token and client ID from [apps link](https://discord.com/developers/applications)
2. Modify the `.env` file with the required details
3. Run the bot: 
```bash
npm run start
```

## Commands

**/zoomin:** Begin the zoom process on your image sequence

**/zoomout:** Revert or stop the zoom process

**Note:** The bot looks up the last upscale in the channel, tracing back all related messages to see if they're upscales themselves.

## Issues
The zoom transition could be smoother. Feel free to contribute and enhance the experience!
