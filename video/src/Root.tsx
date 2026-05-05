import React from "react";
import {Composition} from "remotion";
import {BridgetafelPromo} from "./BridgetafelPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BridgetafelPromo"
      component={BridgetafelPromo}
      durationInFrames={1080}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
