// Top-level flow: attract demo -> choose business -> World 1 (night, get found)
// -> results + email gate -> World 2 (day, speed to lead) -> final report.
import { getWorld, type Industry } from './content';
import { Input } from './engine/input';
import { Stage } from './render/stage';
import { showFinalResults, showWorldResults } from './results';
import { resetRun, run, startWorld } from './state';
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
  private demoWorld: 1 | 2 = 1;

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

  /** Title screen over a bot playing; alternates between the night and day worlds. */
  attract() {
    this.ui.showHud(true);
    const number = this.demoWorld;
    this.demoWorld = number === 1 ? 2 : 1;
    this.setWorld(new World({ demo: true, industry: 'home', number, stage: this.stage, ui: this.ui, input: this.input, onDemoEnd: () => this.attract() }));
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
    resetRun(industry);
    void this.play(industry, 1);
  }

  private async play(industry: Industry, number: 1 | 2) {
    startWorld(number);
    const world = new World({
      demo: false,
      industry,
      number,
      stage: this.stage,
      ui: this.ui,
      input: this.input,
      onVictory: () => this.finish(number),
    });
    this.setWorld(world);
    this.ui.showHud(true);
    world.frozen = true;
    const def = getWorld(industry, number);
    await this.ui.introCard(`World ${number}-1`, def.title, def.intro);
    if (this.world !== world) return;
    world.frozen = false;
  }

  private finish(number: 1 | 2) {
    this.input.enabled = false; // let the form have the keyboard
    const replay = () => {
      this.input.enabled = true;
      this.setWorld(undefined);
      void this.chooseAndPlay();
    };
    if (number === 1) {
      showWorldResults({
        onContinue: () => {
          this.input.enabled = true;
          sfx.startMusic();
          void this.play(run.industry, 2);
        },
      });
    } else {
      showFinalResults({ onPlayAgain: replay });
    }
  }
}
