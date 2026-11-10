import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { BridgeShort as ShirtShort, BRIDGE_FRAMES as SHIRT_FRAMES } from "./videos/shirt/Bridge";
import { BridgeShort as EiffelShort, BRIDGE_FRAMES as EIFFEL_FRAMES } from "./videos/eiffel/Bridge";
export const Root: React.FC = () => (<>
  <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="ShirtShort" component={ShirtShort} durationInFrames={SHIRT_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="EiffelShort" component={EiffelShort} durationInFrames={EIFFEL_FRAMES} fps={30} width={1080} height={1920} />
</>);
