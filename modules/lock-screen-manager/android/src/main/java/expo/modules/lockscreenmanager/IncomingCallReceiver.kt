package expo.modules.lockscreenmanager

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper

/**
 * Decline, or a swipe-away, on the incoming-call notification. The
 * notification goes at once; JavaScript then stops the ringtone, remembers the
 * call as ended and tells the caller. The broadcast is held open for a few
 * seconds so the process is not frozen before that request is sent.
 */
class IncomingCallReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val action = intent.getStringExtra(CallActions.EXTRA_ACTION) ?: return
    val data = intent.getBundleExtra(CallActions.EXTRA_DATA)
    if (action == CallActions.DECLINE) {
      IncomingCallNotification.cancel(context, data?.getString("chatId"))
    }
    val id = CallActions.push(action, data, goAsync())
    Handler(Looper.getMainLooper()).postDelayed({ CallActions.done(id) }, HOLD_MS)
    CallActions.wake(context)
  }

  private companion object {
    // Under the 10 s limit for a foreground broadcast.
    const val HOLD_MS = 8_000L
  }
}
