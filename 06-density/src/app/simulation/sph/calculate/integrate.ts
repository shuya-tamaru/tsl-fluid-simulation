import { abs, float, Fn, If, instanceIndex, sign, vec3 } from "three/tsl";
import type { StorageBufferType } from "../../../types/BufferType";
import type { UniformTypeOf } from "../../../types/UniformType";

export function computeIntegratePass(
  positionsBuffer: StorageBufferType,
  velocitiesBuffer: StorageBufferType,
  boxWidth: UniformTypeOf<number>,
  boxHeight: UniformTypeOf<number>,
  boxDepth: UniformTypeOf<number>,
  delta: number,
  restitution: number
) {
  return Fn(() => {
    const pos = positionsBuffer.element(instanceIndex);
    const vel = velocitiesBuffer.element(instanceIndex);

    const gravity = vec3(0, -9.8, 0).toVar();
    const acceleration = gravity.toVar();

    const newVel = vel.add(acceleration.mul(float(delta))).toVar();
    const newPos = pos.add(newVel.mul(float(delta))).toVar();

    If(abs(newPos.x).greaterThan(boxWidth.div(2)), () => {
      newPos.x.assign(boxWidth.div(2).mul(sign(newPos.x)));
      const dumpVel = newVel.x.mul(-1.0).mul(float(1.0 - restitution));
      newVel.x.assign(dumpVel);
    });

    If(abs(newPos.y).greaterThan(boxHeight.div(2)), () => {
      newPos.y.assign(boxHeight.div(2).mul(sign(newPos.y)));
      const dumpVel = newVel.y.mul(-1.0).mul(float(1.0 - restitution));
      newVel.y.assign(dumpVel);
    });

    If(abs(newPos.z).greaterThan(boxDepth.div(2)), () => {
      newPos.z.assign(boxDepth.div(2).mul(sign(newPos.z)));
      const dumpVel = newVel.z.mul(-1.0).mul(float(1.0 - restitution));
      newVel.z.assign(dumpVel);
    });

    vel.assign(newVel);
    pos.assign(newPos);
  });
}
