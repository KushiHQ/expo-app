package expo.modules.lockscreenmanager

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log

/**
 * Answer, and a tap on the incoming-call notification, land here first. This
 * activity has no screen: it records what was tapped (CallActions), opens the
 * app, and finishes.
 *
 * Recording the tap before the app's own activity starts is what makes Answer
 * dependable. Sending the action on the app activity's intent is not: when
 * Android restores an app it killed, it hands that intent over as a "new
 * intent" while React Native is still starting, and React Native drops it.
 */
class IncomingCallActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handle(intent)
    finish()
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    handle(intent)
    finish()
  }

  private fun handle(intent: Intent?) {
    val action = intent?.getStringExtra(CallActions.EXTRA_ACTION) ?: return
    val data = intent.getBundleExtra(CallActions.EXTRA_DATA)
    CallActions.push(action, data)
    // Answer takes the notification down at once; a tap leaves it up while
    // the ringing screen opens.
    if (action == CallActions.ANSWER) {
      IncomingCallNotification.cancel(this, data?.getString("chatId"))
    }
    try {
      val app = packageManager.getLaunchIntentForPackage(packageName)
      if (app != null) {
        app.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivity(app)
      }
    } catch (t: Throwable) {
      Log.w(CallActions.TAG, "could not open the app for a call action", t)
    }
    CallActions.wake(this)
  }
}
