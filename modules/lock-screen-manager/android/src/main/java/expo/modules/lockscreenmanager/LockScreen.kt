package expo.modules.lockscreenmanager

import android.app.Activity
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.WindowManager
import java.lang.ref.WeakReference

/**
 * Whether the app's activity shows over the lock screen (and wakes the display).
 *
 * JavaScript asks for it while a call screen is up. That alone is not enough
 * for a call that arrives on a sleeping, locked phone: Android starts the
 * activity but draws nothing until it may show over the lock screen, so
 * JavaScript never gets as far as opening the call screen. So the call's
 * full-screen launch also holds it on natively for a few seconds, long enough
 * for the call screen to open and take over. If no call screen comes (the
 * caller hung up), the hold runs out and the app is back behind the lock.
 */
object LockScreen {
  private var activity: WeakReference<Activity>? = null

  @Volatile
  private var wanted = false

  @Volatile
  private var holdUntil = 0L

  private val handler = Handler(Looper.getMainLooper())

  fun attach(current: Activity) {
    activity = WeakReference(current)
    apply()
  }

  fun detach(current: Activity) {
    if (activity?.get() === current) activity = null
  }

  /** What JavaScript wants: true while a call screen is showing. */
  fun request(show: Boolean, current: Activity?) {
    wanted = show
    if (activity?.get() == null && current != null) activity = WeakReference(current)
    apply()
  }

  /** Show over the lock screen for this long, whatever JavaScript last asked. */
  fun hold(ms: Long) {
    holdUntil = SystemClock.elapsedRealtime() + ms
    apply()
    handler.postDelayed({ apply() }, ms + 50)
  }

  private fun apply() {
    val current = activity?.get() ?: return
    val show = wanted || SystemClock.elapsedRealtime() < holdUntil
    current.runOnUiThread { set(current, show) }
  }

  private fun set(activity: Activity, show: Boolean) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      activity.setShowWhenLocked(show)
      activity.setTurnScreenOn(show)
    } else {
      @Suppress("DEPRECATION")
      val flags =
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
      if (show) activity.window.addFlags(flags) else activity.window.clearFlags(flags)
    }
  }
}
