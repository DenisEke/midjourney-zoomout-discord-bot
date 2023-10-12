import React, { useEffect } from "react";
import {
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
  AbsoluteFill,
  Img,
  staticFile,
} from "remotion";
import { preloadImage } from "@remotion/preload";

interface ZoomProps {
  images: string[];
  reverse?: boolean;
}

export const Zoom: React.FC<ZoomProps> = ({ images, reverse }) => {
  const {
    fps,
    durationInFrames,
    height,
    width: originalWidth,
  } = useVideoConfig();
  const width = originalWidth + 200;
  const frame = useCurrentFrame();
  const framesPerImage = durationInFrames / images.length;

  useEffect(() => {
    images.forEach((image) => preloadImage(image));
  }, [images]);

  const currentIndex = Math.floor(frame / framesPerImage);

  const progress = interpolate(
    frame,
    [
      currentIndex * framesPerImage,
      currentIndex * framesPerImage + framesPerImage,
    ],
    [0, 1],
    { easing: Easing.linear }
  );

  return (
    <AbsoluteFill className="bg-gray-100 -z-20">
      <div className="flex items-center justify-center w-full h-full">
        {[2].map((pow, index) => {
          if (currentIndex - index - 1 < 0) return null;

          return (
            <Img
              className={`fixed aspect-[${width}/${height}]`}
              style={{
                maxWidth: "1600%",
                width: `${width * pow + progress * (width * pow)}px`,
                opacity: 1,
              }}
              src={getCorrectSrc(images[currentIndex - index - 1])}
            />
          );
        })}

        <Img
          className={`fixed aspect-[${width}/${height}] ${
            currentIndex === 0 ? "" : "mask"
          }`}
          style={{
            maxWidth: "1600%",
            width: `${width + progress * width}px`,
            opacity: currentIndex === 0 ? 1 : 0.5 + progress / 2,
          }}
          src={getCorrectSrc(images[currentIndex])}
        />

        {[2, 4, 8, 16, 32].map((pow, index) => {
          if (currentIndex + index + 1 >= images.length) return null;

          const endOpacity = 1 / pow;
          const startOpacity = endOpacity / 2;
          return (
            <Img
              className={`fixed aspect-[${width}/${height}] mask`}
              style={{
                maxWidth: "1600%",
                width: `${width / pow + progress * (width / pow)}px`,
                opacity: startOpacity + progress * (endOpacity - startOpacity),
              }}
              src={getCorrectSrc(images[currentIndex + index + 1])}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

function getCorrectSrc(string: string) {
  return string.includes("http") ? string : staticFile(string);
}
