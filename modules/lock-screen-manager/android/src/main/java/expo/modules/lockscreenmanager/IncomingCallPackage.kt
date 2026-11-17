package expo.modules.lockscreenmanager

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

/**
 * Hooks the app's activity (Expo finds this class by its name and import):
 * keeps LockScreen pointed at it, and picks up the incoming-call notification's
 * full-screen launch, which Android sends straight to the app's activity when
 * the phone is locked or asleep. It is handled here, at the activity, because
 * that works before React Native has started.
 */
class IncomingCallPackage : Package {
  override fun createReactActivityLifecycleListeners(
    activityContext: Context?
  ): List<ReactActivityLifecycleListener> = listOf(ActivityListener())

  private class ActivityListener : ReactActivityLifecycleListener {
    override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
      LockScreen.attach(activity)
      take(activity.intent)
    }

    override fun onNewIntent(intent: Intent?): Boolean {
      take(intent)
      return false
    }

    override fun onDestroy(activity: Activity) {
      LockScreen.detach(activity)
    }

    private fun take(intent: Intent?) {
      val action = intent?.getStringExtra(CallActions.EXTRA_ACTION) ?: return
      val data = intent.getBundleExtra(CallActions.EXTRA_DATA)
      // Once: a later look at the same intent must not replay it.
      intent.removeExtra(CallActions.EXTRA_ACTION)
      intent.removeExtra(CallActions.EXTRA_DATA)
      CallActions.push(action, data)
      if (action == CallActions.FULL_SCREEN) LockScreen.hold(LOCK_SCREEN_HOLD_MS)
      CallActions.listener?.invoke()
    }
  }

  private companion object {
    // Long enough for a cold start to reach the call screen.
    const val LOCK_SCREEN_HOLD_MS = 15_000L
  }
}
