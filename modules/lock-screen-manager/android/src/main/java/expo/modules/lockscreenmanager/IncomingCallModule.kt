package expo.modules.lockscreenmanager

import android.os.Bundle
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * The Android incoming-call notification (IncomingCallNotification) and the
 * taps on it (CallActions), for lib/call in JavaScript.
 */
class IncomingCallModule : Module() {
  private val context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("KushiIncomingCall")

    Events("onAction")

    OnCreate {
      CallActions.listener = {
        try {
          sendEvent("onAction", Bundle())
        } catch (_: Throwable) {
        }
      }
    }

    OnDestroy {
      CallActions.listener = null
    }

    Function("show") { call: Map<String, Any?> ->
      IncomingCallNotification.show(context, call)
    }

    Function("cancel") { chatId: String ->
      IncomingCallNotification.cancel(context, chatId)
    }

    // Calls whose notification is still up, as the data they were shown with.
    Function("active") {
      IncomingCallNotification.active(context).map { toMap(it) }
    }

    // Everything the user did with a call notification since the last pull.
    Function("takeActions") {
      CallActions.drain().map {
        mapOf(
          "id" to it.getInt("id"),
          "action" to it.getString("action"),
          "data" to toMap(it.getBundle("data"))
        )
      }
    }

    Function("done") { id: Int ->
      CallActions.done(id)
    }

    Function("canUseFullScreenIntent") {
      IncomingCallNotification.canUseFullScreenIntent(context)
    }
  }

  private fun toMap(bundle: Bundle?): Map<String, String> {
    val out = HashMap<String, String>()
    bundle?.keySet()?.forEach { key -> bundle.getString(key)?.let { out[key] = it } }
    return out
  }
}
