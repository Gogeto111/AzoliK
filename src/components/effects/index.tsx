import { AuroraBackground } from "./AuroraBackground";
import { NeuralNetwork } from "./NeuralNetwork";
import { CursorGlow } from "./CursorGlow";
import { Particles } from "./Particles";
import { ClickRipple } from "./ClickRipple";

export function SceneFX() {
  return (
    <>
      <AuroraBackground />
      <NeuralNetwork />
      <Particles />
      <CursorGlow />
      <ClickRipple />
    </>
  );
}
