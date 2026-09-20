/**
 * Web Audio API Sound Chime Synthesizer & Browser Notifications Engine
 */

let audioCtx = null;
const notifiedOrders = new Set();

/**
 * Initialize / Resume AudioContext & request Notification Permission
 */
export async function enableAudioAndNotifications() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // Play test chime to unlock audio context immediately
    playChimeTone();

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    return true;
  } catch (err) {
    console.warn('Audio/Notification enable error:', err);
    return false;
  }
}

/**
 * Synthesizes a clean 2-tone notification chime (D5 -> A5)
 */
export function playChimeTone() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (audioCtx.state !== 'running') return false;

    const now = audioCtx.currentTime;

    // Tone 1: D5 (587.33 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: A5 (880.00 Hz)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.18);
    gain2.gain.setValueAtTime(0.35, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.6);

    return true;
  } catch (err) {
    console.warn('Chime play exception:', err);
    return false;
  }
}

/**
 * Triggers native system browser notification for a new order
 */
export function triggerBrowserNotification(order) {
  if (!order || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const orderKey = order.id || order.orderNumber;
  if (notifiedOrders.has(orderKey)) return;

  notifiedOrders.add(orderKey);

  const displayId = order.orderNumber || order.id;
  const title = `🔔 New Order #${displayId}`;
  const amount = Number(order.totalAmount || order.total || 0).toLocaleString();
  const body = `${order.customerName || 'Guest'} — Rs. ${amount}`;

  try {
    const notification = new Notification(title, {
      body,
      tag: orderKey,
      renotify: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.warn('Browser notification trigger exception:', err);
  }
}

/**
 * Checks if AudioContext is ready or suspended
 */
export function isAudioReady() {
  return audioCtx && audioCtx.state === 'running';
}
