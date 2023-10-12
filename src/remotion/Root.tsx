import React from "react";
import "./style.css";
import { Composition, getInputProps } from "remotion";
import { Zoom } from "./Zoom";

const { fps, durationInFrames, width, height } = getInputProps();

const IMAGES_WEB = [
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126853242811318292/stahltraeger_The_view_of_our_solar_system_from_the_outer_edges__f405d4c8-5962-4f83-8776-f1f5959ea5c3.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126852865344933918/stahltraeger_The_Blue_Planet_our_Earth_seen_from_the_surface_of_40d8b967-e8f8-4fb3-9057-e7ad4a9d0cff.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126852448418529362/stahltraeger_An_aerial_view_of_Earth_at_night_cities_aglow_with_15f7d862-e2d1-4509-9649-52f558a59dc5.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126851885190627338/stahltraeger_A_room_filled_with_large_computer_mainframes_symbo_55d7a2a8-9d4e-4e7b-aa09-6b561b7b4e78.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126851214798225539/stahltraeger_An_early_twentieth-century_city_its_skyline_evolvi_a7cf20fe-65c1-4dbd-87d0-8afc6dae3fe6.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126850242092994631/stahltraeger_A_science_laboratory_aglow_with_electric_lights_su_6ef5b35e-eeae-4fef-b22c-a34b47627d9e.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126849735983124580/stahltraeger_An_industrial_cityscape_under_a_cloudy_sky_dominat_e65392c6-60e5-428f-9f40-e5eb829079d1.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126848835998732399/stahltraeger_An_expansive_view_of_an_ancient_civilization_nestl_0ad251c8-ecd4-4bd8-b357-b670f4ba3e19.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126848481215135844/stahltraeger_A_panoramic_view_of_a_bustling_ancient_city_with_s_8aecda63-0d32-4cb6-bb81-4c278e0a7226.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126847897464487966/stahltraeger_Green_shoots_sprouting_from_the_well-tended_ground_6db55e3d-8b12-402d-af46-4dac5dc67e68.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126844798121291876/stahltraeger_A_patch_of_earth_tilled_and_ready_for_sowing_under_0569698c-ea21-435b-b77b-c6bc9ef3c3d1.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126844374144274503/stahltraeger_Nestled_within_the_comforting_confines_of_a_dark_c_72a9ead5-54a0-4893-a267-b483d833a896.png",
  "https://cdn.discordapp.com/attachments/1126842756963237968/1126843623560986674/stahltraeger_A_small_cluster_of_bright_warm_flames_flicker_at_t_77528917-0e12-415b-95b9-509ed9d3e82a.png",
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ZoomVideo"
        component={Zoom}
        durationInFrames={durationInFrames ?? IMAGES_WEB.length * 60}
        defaultProps={{
          images: IMAGES_WEB,
          reverse: true,
        }}
        fps={fps ?? 60}
        width={width ?? 1080}
        height={height ?? 1080}
      />
    </>
  );
};
