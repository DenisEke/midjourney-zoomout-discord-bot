import { Config } from "remotion";
import { webpackOverride } from "./src/remotion/webpack-override";

Config.setImageFormat("jpeg");
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig(webpackOverride);

Config.setConcurrency(16);
