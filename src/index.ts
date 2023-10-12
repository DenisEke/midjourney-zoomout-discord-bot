import "dotenv/config";
import {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  TextChannel,
  Message,
  MessageType,
  CommandInteraction,
} from "discord.js";
import { bundle } from "@remotion/bundler";
import path from "path";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind";
import { webpackOverride } from "./remotion/webpack-override";
import sharp from "sharp";
import axios from "axios";

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  {
    name: "video",
    description: "Generates a video from the images in the channel.",
  },
  {
    name: "zoomin",
    description: "Takes the last upscaled image and zooms in to its origin.",
  },
  {
    name: "zoomout",
    description: "Takes the last upscaled image and zooms out from its origin.",
  },
];

start()
  .then(() => console.log("Started!"))
  .catch(console.error);

async function start() {
  await generateBundle();
  await refreshCommands();
  await startClient();
}

let bundleLocation: string;
async function generateBundle() {
  // You only have to do this once, you can reuse the bundle.
  const entry = "./src/remotion/index.ts";
  console.log("Creating a Webpack bundle of the video");
  bundleLocation = await bundle(path.resolve(entry), () => undefined, {
    // If you have a Webpack override, make sure to add it here
    webpackOverride: webpackOverride,
  });
}

async function refreshCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

async function handleVideo(
  interaction: CommandInteraction,
  client: Client,
  zoomIn: boolean
) {
  console.log("Received Video Generation Request");
  const reply = await interaction.reply("Fetching Messages...");

  const channel = (await client.channels.fetch(
    interaction.channelId
  )) as TextChannel;

  // go up messages until you find an upscaled image
  let message = (await channel.messages.fetch({ limit: 1 })).first();
  if (!message) {
    reply.edit("❌ No messages found.");
    return;
  }

  await message.fetch();
  while (!isUpscaledImage(message)) {
    const messages = await channel.messages.fetch({
      limit: 1,
      before: message.id,
    });
    message = messages.first();
    await message.fetch();

    if (!message) {
      reply.edit("❌ No initial image found.");
      return;
    }
  }

  console.log("Found message: " + message.id, message.attachments.first().url);

  const images = await getImages(message);
  console.log("Found images: " + images.length, images);
  channel.send(images.length + " images found. Generating video...");

  // generate video
  const outputPath = "./out/" + interaction.id + ".mp4";
  await generateVideo(images, zoomIn, outputPath);

  await channel.send({
    files: [
      {
        attachment: outputPath,
        name: "video.mp4",
      },
    ],
  });

  return;
}

async function startClient() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
      case "ping":
        await interaction.reply("Pong!");
        break;
      case "zoomin":
        await handleVideo(interaction, client, true);
        break;
      case "zoomout":
        await handleVideo(interaction, client, false);
        break;
      default:
        await interaction.reply("Unknown command");
        console.log("Unknown command");
        break;
    }
  });
  client.login(process.env.TOKEN);
}

async function generateVideo(
  images: string[],
  zoomIn: boolean,
  outputPath: string
) {
  // The composition you want to render
  const compositionId = "ZoomVideo";

  // get width and height using sharp
  const { width, height } = await getWidthAndHeight(images[0]);

  // Parametrize the video by passing arbitrary props to your component.
  const FPS = 60;
  const inputProps = {
    fps: FPS,
    durationInFrames: images.length * FPS * 0.4,
    images,
    width,
    height,
    reverse: !zoomIn,
  };

  // Extract all the compositions you have defined in your project
  // from the webpack bundle.
  const comps = await getCompositions(bundleLocation, {
    // You can pass custom input props that you can retrieve using getInputProps()
    // in the composition list. Use this if you want to dynamically set the duration or
    // dimensions of the video.
    inputProps,
  });

  // Select the composition you want to render.
  const composition = comps.find((c) => c.id === compositionId);

  // Ensure the composition exists
  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found.`);
  }

  const outputLocation = outputPath;
  console.log("Attempting to render:", outputLocation);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps,
  });
  console.log("Render done!");
}

async function getWidthAndHeight(
  url: string
): Promise<{ width: number; height: number }> {
  try {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(response.data, "binary");
    const { width, height } = await sharp(imageBuffer).metadata();
    return { width, height };
  } catch (e) {
    console.error("Error:", e);
    throw e;
  }
}

async function getImages(message: Message): Promise<string[]> {
  const result = [];
  result.push(message.attachments.first().url);

  while (message.type === MessageType.Reply && message.reference.messageId) {
    message = await message.channel.messages.fetch(message.reference.messageId);
    if (
      isUpscaledImage(message) &&
      message.author.id === "936929561302675456" // Midjourney Bot ID
    ) {
      result.push(message.attachments.first().url);
    }
  }

  return result;
}

function isUpscaledImage(message: Message): boolean {
  // check if it is a reply
  if (message.type !== MessageType.Reply) return false;

  // check if it contains an image
  if (message.attachments.size === 0) return false;
  let url = message.attachments.at(0).url;
  if (!url) return false;

  // check if action items contain "Web"
  if (!message.components) return false;
  for (let i = 0; i < message.components.length; i++) {
    const componentAsJson = message.components[i].toJSON() as any;
    for (let component of componentAsJson.components) {
      if (component.label === "Web" && component.url) {
        return true;
      }
    }
  }

  return false;
}
