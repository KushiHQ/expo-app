package expo.modules.lockscreenmanager

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactApplication

/**
 * What the user did with the incoming-call notification (Answer, Decline, a
 * tap on it, the full-screen launch, a swipe-away), waiting for JavaScript.
 *
 * JavaScript pulls these (IncomingCallModule.takeActions) when the bundle
 * loads, when the app mounts, when it comes to the foreground and whenever
 * "onAction" fires. Nothing is pushed at a listener that may not exist yet, so
 * a tap can't be lost between a cold start and the app mounting.
 */
object CallActions {
  const val TAG = "KushiCall"
  const val EXTRA_ACTION = "kushi.call.action"
  const val EXTRA_DATA = "kushi.call.data"

  const val ANSWER = "answer"
  const val DECLINE = "decline"
  const val OPEN = "open"
  const val FULL_SCREEN = "full_screen"
  const val DISMISS = "dismiss"

  private val queue = ArrayList<Bundle>()
  private val holds = HashMap<Int, BroadcastReceiver.PendingResult>()
  private var lastId = 0

  /** Set while the React module is alive: tells JavaScript to come and pull. */
  @Volatile
  var listener: (() -> Unit)? = null

  @Synchronized
  fun push(action: String, data: Bundle?, hold: BroadcastReceiver.PendingResult? = null): Int {
    val id = ++lastId
    queue.add(
      Bundle().apply {
        putInt("id", id)
        putString("action", action)
        putBundle("data", data ?: Bundle())
      }
    )
    if (hold != null) holds[id] = hold
    Log.i(TAG, "action $action queued (#$id)")
    return id
  }

  @Synchronized
  fun drain(): List<Bundle> {
    val out = ArrayList(queue)
    queue.clear()
    return out
  }

  /** JavaScript finished with a broadcast action: let the receiver go. */
  @Synchronized
  fun done(id: Int) {
    try {
      holds.remove(id)?.finish()
    } catch (_: Throwable) {
    }
  }

  /**
   * Reads a call action off an activity intent, once: the extra is removed so
   * a later look at the same intent (a remount) does not replay it.
   */
  fun fromIntent(intent: Intent?): Boolean {
    val action = intent?.getStringExtra(EXTRA_ACTION) ?: return false
    val data = intent.getBundleExtra(EXTRA_DATA)
    intent.removeExtra(EXTRA_ACTION)
    intent.removeExtra(EXTRA_DATA)
    push(action, data)
    return true
  }

  /** Get JavaScript to pull: poke the live module, or start React in a killed app. */
  fun wake(context: Context) {
    val poke = listener
    if (poke != null) {
      poke()
      return
    }
    try {
      val app = context.applicationContext as? ReactApplication
      app?.reactHost?.start()
      Log.i(TAG, "started React for a queued call action")
    } catch (t: Throwable) {
      Log.w(TAG, "could not start React for a call action", t)
    }
  }
}
