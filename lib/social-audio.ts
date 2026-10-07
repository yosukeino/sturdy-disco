/**
 * Web Audio APIを用いた軽量シンセサイザー
 * 音源ファイル不要・オフラインでも動作・低レイテンシ
 */

export function playSocialSound(
  type: 'correct' | 'wrong' | 'reveal' | 'complete' | 'click',
  isMuted: boolean = false
): void {
  if (isMuted || typeof window === 'undefined') return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'click') {
      // 軽いタップ音
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'reveal') {
      // めくり音・シュッとした風切り音＆ベル音
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'correct') {
      // 心地よいピンポン・正解チャイム (E5 -> G#5 -> B5 明るいメジャーコード)
      const freqs = [659.25, 830.61, 987.77];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } else if (type === 'wrong') {
      // 落ち着いた低めの「ブッ」（威圧感のないやわらかい通知音）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'complete') {
      // セッション達成ファンファーレ (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.1;
        const dur = idx === notes.length - 1 ? 0.7 : 0.25;

        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    }
  } catch {
    // AudioContext非対応環境でのフォールバック
  }
}
