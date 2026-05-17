package expo.modules.lockscreenmanager

import android.os.Build
import android.view.WindowManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LockScreenManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LockScreenManager")

    Function("setShowWhenLocked") { show: Boolean ->
      val activity = appContext.currentActivity ?: return@Function
      activity.runOnUiThread {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
          activity.setShowWhenLocked(show)
          activity.setTurnScreenOn(show)
        } else {
          @Suppress("DEPRECATION")
          if (show) {
            activity.window.addFlags(
              WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
              WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
          } else {
            activity.window.clearFlags(
              WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
              WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
          }
        }
      }
    }
  }
}
