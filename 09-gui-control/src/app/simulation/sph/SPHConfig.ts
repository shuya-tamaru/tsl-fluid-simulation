export class SPHConfig {
  public particleCount = 5000;
  public mass = 0.4;
  public delta = 1 / 60;
  public restitution = 0.8;
  public h = 1.0;
  public restDensity = 1.0;
  public pressureStiffness = 100;
  public viscosityMu = 0.12;

  get h2() {
    return Math.pow(this.h, 2);
  }
  get h3() {
    return Math.pow(this.h, 3);
  }
  get h6() {
    return Math.pow(this.h, 6);
  }
  get h9() {
    return Math.pow(this.h, 9);
  }
  get poly6Kernel() {
    return 315 / (64 * Math.PI * this.h9);
  }
  get spikyKernel() {
    return -45 / (Math.PI * this.h6);
  }

  get viscosityKernel() {
    return 45 / (Math.PI * this.h6);
  }
}
