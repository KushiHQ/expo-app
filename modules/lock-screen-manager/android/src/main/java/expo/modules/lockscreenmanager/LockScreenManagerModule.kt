package expo.modules.lockscreenmanager

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LockScreenManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LockScreenManager")

    // JavaScript turns this on while a call screen is up (see LockScreen).
    Function("setShowWhenLocked") { show: Boolean ->
      LockScreen.request(show, appContext.currentActivity)
    }
  }
}
