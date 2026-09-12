import { TIER_FREQUENCIES } from "./config";

class SoundManager {
    private ctx: AudioContext | null = null;
    public isMuted: boolean = false;

    constructor() {
        // load saved mute preference
        this.isMuted = localStorage.getItem('flag_fusion_2026_muted') === 'true';
    }

    private initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state == 'suspended') {
            this.ctx.resume();
        }
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        localStorage.setItem('flag_fusion_2026_muted', this.isMuted.toString());
        return this.isMuted;
    }

    // drop woosh / pop
    public playDrop() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Pitch drop sweep
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    // ascending musical merge chime
    public playMerge(level: number) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const freq = TIER_FREQUENCIES[Math.min(level - 1, TIER_FREQUENCIES.length - 1)] || 440;

        // Primary bell tone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Harmonic overtone for chime shimmer
        const harmonic = this.ctx.createOscillator();
        const harmGain = this.ctx.createGain();
        harmonic.type = 'triangle';
        harmonic.frequency.setValueAtTime(freq * 2, this.ctx.currentTime);

        const duration = 0.45;
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        harmGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        harmGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration * 0.7);

        osc.connect(gain);
        harmonic.connect(harmGain);
        gain.connect(this.ctx.destination);
        harmGain.connect(this.ctx.destination);

        osc.start();
        harmonic.start();
        osc.stop(this.ctx.currentTime + duration);
        harmonic.stop(this.ctx.currentTime + duration);
    }

    // soft physical ball impact
    public playBounce(speedRatio: number = 0.5) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.05);

        const volume = Math.min(Math.max(speedRatio * 0.15, 0.03), 0.18);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // spain world cup champion arpeggio fanfare
    public playChampion() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        // C - E - G - C fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, index) => {
            const startTime = this.ctx!.currentTime + index * 0.12;
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.6);
        });
    }

    // game over descending melancholy tone
    public playGameOver() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [440, 392, 349.23, 293.66]; // A4 -> G4 -> F4 -> D4
        notes.forEach((freq, index) => {
            const startTime = this.ctx!.currentTime + index * 0.18;
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.35);
        });
    }
}

export const soundManager = new SoundManager();