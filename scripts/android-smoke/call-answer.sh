#!/usr/bin/env bash
# Incoming-call notification checks, run on the emulator after the app is
# installed (run.sh calls this; it also runs alone on other Android versions).
#
# For each app state it injects an incoming-call push, screenshots the
# notification, taps Answer (or Decline) on it the way a person would, and then
# reads the app's own call log ("[call] …" lines in logcat) to see whether the
# tap reached the call screen and started joining the call.
#
#   bg-alive      app opened, then sent to the background (process alive)
#   fcm-started   app killed; the push itself starts the process (tap at 3/6/12 s)
#   cold-tap      app killed while the notification is up (cold start from the tap)
#   late          Answer tapped 40 s into the 50 s ring window
#   shade         Answer tapped in the notification shade, not the banner
#   body          the notification body tapped (opens the ringing screen)
#   decline       Decline tapped: no app launch, the caller is told
#   locked        screen off and locked when the call arrives
#
# The call ids are made up, so Daily has no room to join: "join.start" is the
# furthest a call can get here. A real two-phone call is still needed for audio.
#
# Usage: call-answer.sh <out-dir> [cases…]
set -u
OUT="$1"; shift
CASES="${*:-bg-alive fcm-started-3 fcm-started-6 fcm-started-12 cold-tap late shade body decline locked}"
PKG=com.kushicorp.kushi
mkdir -p "$OUT/shots"
LOG="$OUT/logcat-calls.txt"
RESULT="$OUT/call-answer.txt"
: > "$RESULT"

adb logcat -v threadtime > "$LOG" 2>&1 &
LOGCAT_PID=$!
trap 'kill $LOGCAT_PID 2>/dev/null' EXIT

API=$(adb shell getprop ro.build.version.sdk | tr -d '\r')
echo "Android API $API" | tee -a "$RESULT"

shot() { adb exec-out screencap -p > "$OUT/shots/$1.png" 2>/dev/null || true; }

push() {
  adb shell am broadcast -a com.google.android.c2dm.intent.RECEIVE -p "$PKG" \
    --es google.message_id "smoke-$RANDOM$RANDOM" --es from 1 --es google.delivered_priority high \
    --es google.original_priority high "$@" >/dev/null
}
ring() { push --es intent voice-call --es chatId "$1" --es callId "$1" --es caller "Smoke Test"; }
cancel() { push --es intent cancel_call --es chatId "$1" --es callId "$1"; }

# Tap the first on-screen element with this label (text or content description).
tap_label() {
  local label="$1" b x1 y1 x2 y2
  for _ in 1 2 3; do
    adb shell uiautomator dump /sdcard/kushi-ui.xml >/dev/null 2>&1
    b=$(adb shell cat /sdcard/kushi-ui.xml 2>/dev/null | sed 's/></>\n</g' \
      | grep -iE "(text|content-desc)=\"$label\"" | head -1 \
      | grep -oE 'bounds="\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]"' | grep -oE '[0-9]+' | tr '\n' ' ')
    if [ -n "$b" ]; then
      read -r x1 y1 x2 y2 <<< "$b"
      adb shell input tap $(( (x1 + x2) / 2 )) $(( (y1 + y2) / 2 ))
      return 0
    fi
    sleep 1
  done
  return 1
}

# Tap a notification button: on the heads-up banner, or else in the shade.
tap_notification() {
  if tap_label "$1"; then echo banner; return 0; fi
  adb shell cmd statusbar expand-notifications; sleep 2
  if tap_label "$1"; then echo shade; return 0; fi
  adb shell cmd statusbar collapse
  return 1
}

# Run alone (APK=… call-answer.sh …): install the app and get past first launch.
if [ -n "${APK:-}" ]; then
  adb root >/dev/null 2>&1 || true
  adb wait-for-device; sleep 5
  adb install -r -g "$APK" || { echo "CALL_ANSWER_FAILED=install" >> "${GITHUB_ENV:-/dev/null}"; exit 0; }
  sleep 20
  adb shell am broadcast -a android.intent.action.CLOSE_SYSTEM_DIALOGS >/dev/null 2>&1 || true
  adb shell am start -n "$PKG/.MainActivity" >/dev/null; sleep 45
  tap_label "Wait" >/dev/null 2>&1 || true
  tap_label "Start exploring" >/dev/null 2>&1 || true
  sleep 6; shot "call-0-first-launch"
fi

pid() { adb shell pidof "$PKG" | tr -d '\r'; }
front() { adb shell dumpsys activity activities | grep -E "ResumedActivity|topResumedActivity" | head -1 | grep -oE "[a-zA-Z0-9_.]+/[a-zA-Z0-9_.]+" | head -1; }
app_log() { awk -v m="KushiSmoke: case $1 start" 'index($0, m) { f = 1 } f' "$LOG" | grep -E "ReactNativeJS.*\[call\]|KushiCall|Cannot start headless|NotifeeHeadlessJS" ; }
notification_up() { adb shell dumpsys notification --noredact | grep -A40 "pkg=$PKG" | grep -cE "category=call" ; }

to_background() {
  adb shell am start -n "$PKG/.MainActivity" >/dev/null; sleep 8
  adb shell input keyevent KEYCODE_HOME; sleep 3
}
kill_app() {
  adb shell input keyevent KEYCODE_HOME; sleep 2
  adb shell am kill "$PKG"; sleep 3
}
tidy() {
  cancel "$1"; sleep 3
  tap_label "OK" >/dev/null 2>&1 || true   # "Couldn't connect the call" (no real room)
  adb shell cmd statusbar collapse
  adb shell input keyevent KEYCODE_HOME; sleep 2
}

verdict() { # verdict <case> <what> <pattern that must appear> [pattern that must not]
  local log; log=$(app_log "$1")
  if echo "$log" | grep -qE "$3" && { [ -z "${4:-}" ] || ! echo "$log" | grep -qE "$4"; }; then
    echo "PASS  $1: $2" | tee -a "$RESULT"
  else
    echo "FAIL  $1: $2" | tee -a "$RESULT"
    echo "CALL_ANSWER_FAILED=1" >> "${GITHUB_ENV:-/dev/null}"
  fi
  { echo "$log" | sed -E 's/^.*ReactNativeJS: /      /' ; echo "      front: $(front)   pid: $(pid)"; echo; } >> "$RESULT"
}

for c in $CASES; do
  id="smoke-$c-$RANDOM"
  adb shell log -t KushiSmoke "case $c start"
  echo "── $c ($id)"
  case "$c" in
    bg-alive)
      to_background
      ring "$id"; sleep 4; shot "call-$c-1-notification"
      where=$(tap_notification "Answer") || echo "      no Answer button found" >> "$RESULT"
      sleep 12; shot "call-$c-2-after-answer"
      verdict "$c" "Answer on the ${where:-?} → call screen joins" "join\.start"
      ;;
    fcm-started-*)
      kill_app; echo "      pid before push: '$(pid)'" >> "$RESULT"
      ring "$id"; sleep "${c##*-}"; shot "call-$c-1-notification"
      where=$(tap_notification "Answer") || echo "      no Answer button found" >> "$RESULT"
      sleep 15; shot "call-$c-2-after-answer"
      verdict "$c" "Answer ${c##*-}s after a push that started the app → call screen joins" "join\.start"
      ;;
    cold-tap)
      to_background
      ring "$id"; sleep 4
      adb shell am kill "$PKG"; sleep 3; echo "      pid before tap: '$(pid)'" >> "$RESULT"
      shot "call-$c-1-notification"
      where=$(tap_notification "Answer") || echo "      no Answer button found" >> "$RESULT"
      sleep 20; shot "call-$c-2-after-answer"
      verdict "$c" "Answer after the app was killed mid-ring → call screen joins" "join\.start"
      ;;
    late)
      kill_app
      ring "$id"; sleep 40; shot "call-$c-1-notification"
      where=$(tap_notification "Answer") || echo "      no Answer button found" >> "$RESULT"
      sleep 15; shot "call-$c-2-after-answer"
      verdict "$c" "Answer 40s into the ring → call screen joins" "join\.start"
      ;;
    shade)
      kill_app
      ring "$id"; sleep 9
      adb shell cmd statusbar expand-notifications; sleep 2; shot "call-$c-1-shade"
      tap_label "Answer" || echo "      no Answer button found" >> "$RESULT"
      sleep 15; shot "call-$c-2-after-answer"
      verdict "$c" "Answer in the shade → call screen joins" "join\.start"
      ;;
    body)
      kill_app
      ring "$id"; sleep 5
      tap_label "Smoke Test" || tap_label "Incoming voice call" || echo "      notification body not found" >> "$RESULT"
      sleep 12; shot "call-$c-2-ringing-screen"
      verdict "$c" "body tap → ringing screen (not answered)" "screen\.open" "join\.start"
      ;;
    decline)
      kill_app
      ring "$id"; sleep 5
      where=$(tap_notification "Decline") || echo "      no Decline button found" >> "$RESULT"
      sleep 8; shot "call-$c-2-after-decline"
      echo "      call notifications left: $(notification_up)" >> "$RESULT"
      verdict "$c" "Decline on the ${where:-?} → call ended, no call screen" "tap\.decline|\"declined\"" "screen\.open"
      ;;
    locked)
      kill_app
      adb shell locksettings set-pin 1234 >/dev/null 2>&1
      adb shell input keyevent KEYCODE_SLEEP; sleep 3
      ring "$id"; sleep 8
      adb shell input keyevent KEYCODE_WAKEUP; sleep 2; shot "call-$c-1-lock-screen"
      # Either the ringing screen is up over the lock screen (full-screen
      # intent), or the lock screen shows the call notification.
      tap_label "Answer" || echo "      no Answer button found on the lock screen" >> "$RESULT"
      sleep 4; shot "call-$c-2-after-tap"
      # A notification button asks for the PIN first.
      adb shell input text 1234; adb shell input keyevent KEYCODE_ENTER
      sleep 12; shot "call-$c-3-after-unlock"
      verdict "$c" "Answer with the phone locked → call screen joins" "join\.start"
      adb shell locksettings clear --old 1234 >/dev/null 2>&1
      adb shell input keyevent KEYCODE_WAKEUP; adb shell wm dismiss-keyguard
      ;;
  esac
  tidy "$id"
done

sleep 3
echo "── Incoming-call results"; cat "$RESULT"
exit 0
