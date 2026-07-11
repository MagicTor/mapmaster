declare module "howler" {
  export interface HowlOptions {
    src: string[];
    volume?: number;
    preload?: boolean;
    onload?: () => void;
    onloaderror?: (id?: number, error?: unknown) => void;
  }

  export class Howl {
    constructor(options: HowlOptions);
    play(id?: number): number;
    stop(id?: number): this;
    volume(): number;
    volume(value: number): this;
    unload(): void;
  }
}
