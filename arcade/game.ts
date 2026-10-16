// Top-level flow: attract demo -> choose business -> World 1 -> results.
import { getIndustry, type Industry } from './content';
import { Input } from './engine/input';
import { Stage } from './render/stage';
import { showResults } from './results';
import { resetRun } from './state';
import { UI } from './ui';
import { World } from './world';
import * as sfx from './sfx';

export class Game {
  readonly stage: Stage;
  readonly ui: UI;
  readonly input = new Input();
  world?: World;
  private last = performance.now();
  private closeTitle?: () => void;

  constructor(stageEl: HTMLElement) {
    this.stage = new Stage(stageEl);
    this.ui = new UI(stageEl);
    this.ui.enableTouch(this.input);
    requestAnimationFrame(this.loop);
  }

  private loop = (t: number) => {
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    this.world?.update(dt);
    this.stage.render(dt);
    requestAnimationFrame(this.loop);
  };

  private setWorld(world?: World) {
    this.world?.dispose();
    this.world = world;
  }

  attract() {
    this.ui.showHud(true);
    this.setWorld(new World({ demo: true, industry: 'home', stage: this.stage, ui: this.ui, input: this.input, onDemoEnd: () => this.attract() }));
    if (!this.closeTitle) {
      this.closeTitle = this.ui.showTitle(() => {
        this.closeTitle = undefined;
        sfx.unlock();
        sfx.startMusic();
        try {
          window.focus();
        } catch {
          /* cross-origin parent */
        }
        void this.chooseAndPlay();
      });
    }
  }

  private async chooseAndPlay() {
    this.ui.showHud(false);
    const industry = await this.ui.chooseIndustry();
    this.play(industry);
  }

  private async play(industry: Industry) {
    resetRun(industry);
    const world = new World({
      demo: false,
      industry,
      stage: this.stage,
      ui: this.ui,
      input: this.input,
      onVictory: () => this.finish(),
    });
    this.setWorld(world);
    this.ui.showHud(true);
    world.frozen = true;
    const def = getIndustry(industry).world1;
    await this.ui.introCard('World 1-1', def.title, def.intro);
    if (this.world !== world) return;
    world.frozen = false;
  }

  private finish() {
    this.input.enabled = false; // let the form have the keyboard
    showResults({
      onPlayAgain: () => {
        this.input.enabled = true;
        this.setWorld(undefined);
        void this.chooseAndPlay();
      },
    });
  }
}
