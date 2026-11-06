// Top-level flow: attract demo -> choose business -> World 1 (night, get found)
// -> results + email gate -> World 2 (day, speed to lead) -> final report.
// The pause menu (Menu button / Escape) can restart, quit to the title, or skip
// straight to the report by answering the remaining questions.
import { getIndustry, getWorld, type Industry } from './content';
import { Input } from './engine/input';
import { Stage } from './render/stage';
import { hideOverlay, showFinalResults, showWorldResults } from './results';
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
  private menuOpen = false;
  private quizzing = false;

  constructor(stageEl: HTMLElement) {
    this.stage = new Stage(stageEl);
    this.ui = new UI(stageEl);
    this.ui.enableTouch(this.input);
    this.ui.onMenu(() => this.openMenu());
    window.addEventListener('keydown', (e) => {
      const t = e.target as HTMLElement | null;
      if (t && ['INPUT', 'TEXTAREA'].includes(t.tagName)) return;
      const k = e.key.toLowerCase();
      if ((k === 'escape' || k === 'p') && !this.menuOpen) {
        e.preventDefault();
        this.openMenu();
      }
    });
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
    this.ui.showMenuButton(false);
    const number = this.demoWorld;
    this.demoWorld = number === 1 ? 2 : 1;
    this.setWorld(new World({ demo: true, industry: 'home', number, stage: this.stage, ui: this.ui, input: this.input, onDemoEnd: () => this.attract() }));
    if (!this.closeTitle) {
      const begin = () => {
        this.closeTitle = undefined;
        sfx.unlock();
        sfx.startMusic();
        try {
          window.focus();
        } catch {
          /* cross-origin parent */
        }
      };
      this.closeTitle = this.ui.showTitle(
        () => {
          begin();
          void this.chooseAndPlay();
        },
        () => {
          begin();
          void this.skipFromTitle();
        },
      );
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
    this.ui.showMenuButton(true);
    world.frozen = true;
    const def = getWorld(industry, number);
    await this.ui.introCard(`World ${number}-1`, def.title, def.intro);
    if (this.world !== world) return;
    world.frozen = false;
  }

  // ---------------------------------------------------------------- pause menu

  private openMenu() {
    const world = this.world;
    if (this.menuOpen || this.quizzing || !world || world.isDemo || world.scripted || this.ui.hasModal()) return;
    this.menuOpen = true;
    world.paused = true;
    sfx.play('select');
    const soundLabel = () => (sfx.isMuted() ? 'Sound: Off' : 'Sound: On');
    const items = [
      { label: 'Resume', action: () => {} },
      { label: `Restart World ${run.world}`, hint: 'Start this world over', action: () => this.restartWorld() },
      { label: 'Skip to my report', hint: 'Answer the questions, skip the game', action: () => void this.skipToReport() },
      {
        label: soundLabel(),
        keepOpen: true,
        action: () => {
          sfx.toggleMute();
          items[3].label = soundLabel();
        },
      },
      { label: 'Main menu', hint: 'Back to the title screen', action: () => this.mainMenu() },
    ];
    this.ui.showMenu(items, () => {
      this.menuOpen = false;
      if (this.world === world && !this.quizzing) world.paused = false;
    });
  }

  private restartWorld() {
    run.score = run.worldStartScore;
    void this.play(run.industry, run.world);
  }

  private mainMenu() {
    this.input.enabled = true;
    hideOverlay();
    this.ui.setBoss(null);
    this.setWorld(undefined);
    this.attract();
  }

  /** "Skip to my report": ask every unanswered question back to back, then show the report. */
  private async skipToReport() {
    if (this.quizzing) return;
    this.quizzing = true;
    run.skipped = true;
    if (this.world) this.world.paused = true;
    this.ui.setBoss(null);
    this.ui.showHud(false);
    sfx.stopMusic();
    const noun = getIndustry(run.industry).noun;
    const all = [getWorld(run.industry, 1), getWorld(run.industry, 2)].flatMap((w) => w.questions.map((q) => ({ w, q })));
    for (const [i, { w, q }] of all.entries()) {
      if (q.id in run.answers) continue;
      run.answers[q.id] = await this.ui.ask(`Question ${i + 1} of ${all.length} · ${w.diagnosis}`, q.prompt(noun), q.answers.map((a) => a.label));
    }
    this.quizzing = false;
    this.input.enabled = false; // let the form have the keyboard
    showFinalResults({
      onPlayAgain: () => {
        this.input.enabled = true;
        this.setWorld(undefined);
        void this.chooseAndPlay();
      },
    });
  }

  /** From the title screen: pick a business, then go straight to the questions. */
  private async skipFromTitle() {
    this.ui.showHud(false);
    if (this.world) this.world.paused = true;
    const industry = await this.ui.chooseIndustry();
    resetRun(industry);
    await this.skipToReport();
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
