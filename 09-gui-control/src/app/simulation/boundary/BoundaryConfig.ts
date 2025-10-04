import { uniform } from "three/tsl";

export class BoundaryConfig {
  public width = uniform(16);
  public height = uniform(16);
  public depth = uniform(16);
}
