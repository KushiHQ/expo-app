package expo.modules.lockscreenmanager

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import androidx.core.app.Person

/**
 * The incoming-call notification: full Answer and Decline buttons on the
 * heads-up banner, in the shade and on the lock screen.
 *
 * - Android 12+: the system call style (green Answer, red Decline pills).
 * - Android 8–11 has no call style, so the same two buttons are drawn with a
 *   custom layout.
 *
 * Answer, a tap on the notification and the full-screen launch open the app's
 * activity directly with the action on the intent; Decline is a broadcast, so
 * it never opens the app. Either way the action waits in CallActions until
 * JavaScript pulls it.
 */
object IncomingCallNotification {
  private const val CHANNEL = "incoming-call-v3"
  private const val NOTIFICATION_TAG = "kushi-call"
  private const val ACTION_PREFIX = "ng.kushi.call."
  private const val AMBER = 0xFFF59E0B.toInt()

  fun show(context: Context, call: Map<String, Any?>) {
    val chatId = call["chatId"] as? String ?: return
    val caller = (call["caller"] as? String)?.takeIf { it.isNotBlank() } ?: "Kushi user"
    val video = call["kind"] == "video"
    val timeout = (call["timeoutMs"] as? Number)?.toLong() ?: 50_000L
    val text = if (video) "Incoming video call" else "Incoming voice call"
    val data = Bundle()
    (call["data"] as? Map<*, *>)?.forEach { (key, value) ->
      if (key is String && value != null) data.putString(key, value.toString())
    }
    data.putString("chatId", chatId)

    val answer = activity(context, chatId, CallActions.ANSWER, data)
    val open = activity(context, chatId, CallActions.OPEN, data)
    val fullScreen = activity(context, chatId, CallActions.FULL_SCREEN, data)
    val decline = broadcast(context, chatId, CallActions.DECLINE, data)
    val dismiss = broadcast(context, chatId, CallActions.DISMISS, data)

    val manager = context.getSystemService(NotificationManager::class.java) ?: return
    ensureChannel(manager)

    val builder =
      NotificationCompat.Builder(context, CHANNEL)
        .setSmallIcon(smallIcon(context))
        .setColor(AMBER)
        .setContentTitle(caller)
        .setContentText(text)
        .setCategory(NotificationCompat.CATEGORY_CALL)
        .setPriority(NotificationCompat.PRIORITY_MAX)
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .setOngoing(true)
        .setAutoCancel(false)
        .setShowWhen(false)
        // The ring window closes by itself: a missed call never sits in the tray.
        .setTimeoutAfter(timeout)
        .setContentIntent(open)
        .setDeleteIntent(dismiss)
        .setFullScreenIntent(fullScreen, true)
        .addExtras(Bundle().apply { putBundle(CallActions.EXTRA_DATA, data) })

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val person = Person.Builder().setName(caller).setImportant(true).build()
      builder.setStyle(
        NotificationCompat.CallStyle.forIncomingCall(person, decline, answer).setIsVideo(video)
      )
    } else {
      // Collapsed rows are 64dp tall, heads-up banners 88dp: one row for the
      // first, name over two full-width buttons for the rest.
      val row = buttons(context, R.layout.kushi_call_notification_row, caller, text, answer, decline)
      val full = buttons(context, R.layout.kushi_call_notification, caller, text, answer, decline)
      builder
        .setCustomContentView(row)
        .setCustomHeadsUpContentView(full)
        .setCustomBigContentView(full)
    }

    val id = chatId.hashCode()
    try {
      manager.notify(NOTIFICATION_TAG, id, builder.build())
    } catch (t: Throwable) {
      // A device that refuses the call style still gets Answer and Decline.
      Log.w(CallActions.TAG, "call-style notification refused; using plain actions", t)
      builder
        .setStyle(null)
        .setCustomContentView(null)
        .setCustomHeadsUpContentView(null)
        .setCustomBigContentView(null)
        .clearActions()
        .addAction(0, "Decline", decline)
        .addAction(0, "Answer", answer)
      manager.notify(NOTIFICATION_TAG, id, builder.build())
    }
  }

  fun cancel(context: Context, chatId: String?) {
    if (chatId == null) return
    context.getSystemService(NotificationManager::class.java)?.cancel(NOTIFICATION_TAG, chatId.hashCode())
  }

  /** The data of every call notification still showing. */
  fun active(context: Context): List<Bundle> {
    val manager = context.getSystemService(NotificationManager::class.java) ?: return emptyList()
    return try {
      manager.activeNotifications
        .filter { it.tag == NOTIFICATION_TAG }
        .mapNotNull { it.notification.extras?.getBundle(CallActions.EXTRA_DATA) }
    } catch (_: Throwable) {
      emptyList()
    }
  }

  /** Android 14+ can withhold the full-screen (lock screen) launch. */
  fun canUseFullScreenIntent(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return true
    return context.getSystemService(NotificationManager::class.java)?.canUseFullScreenIntent() ?: true
  }

  private fun buttons(
    context: Context,
    layout: Int,
    caller: String,
    text: String,
    answer: PendingIntent,
    decline: PendingIntent
  ): RemoteViews =
    RemoteViews(context.packageName, layout).apply {
      setTextViewText(R.id.kushi_call_title, caller)
      setTextViewText(R.id.kushi_call_text, text)
      setOnClickPendingIntent(R.id.kushi_call_answer, answer)
      setOnClickPendingIntent(R.id.kushi_call_decline, decline)
    }

  /** Opens the app's own activity with the action on the intent. */
  private fun activity(context: Context, chatId: String, action: String, data: Bundle): PendingIntent {
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
    // A custom action (not MAIN/LAUNCHER), so Android delivers the intent to
    // the running activity instead of only bringing the task forward.
    val intent =
      Intent(ACTION_PREFIX + action).apply {
        component = launch?.component
        setPackage(context.packageName)
        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_SINGLE_TOP or
            Intent.FLAG_ACTIVITY_CLEAR_TOP
        )
        putExtra(CallActions.EXTRA_ACTION, action)
        putExtra(CallActions.EXTRA_DATA, data)
      }
    return PendingIntent.getActivity(context, requestCode(chatId, action), intent, FLAGS)
  }

  private fun broadcast(context: Context, chatId: String, action: String, data: Bundle): PendingIntent {
    val intent =
      Intent(context, IncomingCallReceiver::class.java).apply {
        setAction(ACTION_PREFIX + action)
        addFlags(Intent.FLAG_RECEIVER_FOREGROUND)
        putExtra(CallActions.EXTRA_ACTION, action)
        putExtra(CallActions.EXTRA_DATA, data)
      }
    return PendingIntent.getBroadcast(context, requestCode(chatId, action), intent, FLAGS)
  }

  private const val FLAGS = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE

  private fun requestCode(chatId: String, action: String) = 31 * chatId.hashCode() + action.hashCode()

  private fun smallIcon(context: Context): Int {
    val icon = context.resources.getIdentifier("ic_notification", "drawable", context.packageName)
    return if (icon != 0) icon else context.applicationInfo.icon
  }

  /** The channel normally exists already (JavaScript creates it); this is the fallback. */
  private fun ensureChannel(manager: NotificationManager) {
    if (manager.getNotificationChannel(CHANNEL) != null) return
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL, "Incoming Calls", NotificationManager.IMPORTANCE_HIGH).apply {
        enableVibration(true)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      }
    )
  }
}
