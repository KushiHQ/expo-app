#!/usr/bin/env bash
# Android release smoke test, run inside the emulator by .github/workflows/android-r8-smoke.yml.
# Installs the APK, drives smoke.yaml with Maestro, then injects FCM data pushes
# (chat message + incoming call) with the app in the foreground, the background
# and killed, and finally scans logcat for crashes and R8 symptoms
# (missing classes/methods, failed JNI lookups).
#
# Usage: run.sh <apk> <out-dir>
set -u
APK="$1"
OUT="$2"
PKG=com.kushicorp.kushi
IMG=https://storage.googleapis.com/kushi-prod-assets/uploads/09493f39-6574-4122-9fe8-0e1662ee8157/37E50B5D-07B0-49AB-929E-6C44E71323DC.png
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$OUT/shots"

# Root lets `am broadcast` deliver c2dm intents that only Google Play services may send.
adb root >/dev/null 2>&1 || true
adb wait-for-device
sleep 5

adb install -r -g "$APK" || { echo "SMOKE_FAILED=install" >> "$GITHUB_ENV"; exit 0; }

# A photo for the picker.
adb push "$HERE/../../assets/icons/icon.png" /sdcard/Pictures/kushi-smoke.png
adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///sdcard/Pictures/kushi-smoke.png >/dev/null 2>&1 || true
adb shell content call --uri content://media/external/file --method scan_volume --arg external_primary >/dev/null 2>&1 || true

# Let the cold emulator settle and clear any ANR dialog it raised while booting.
sleep 30
adb shell am broadcast -a android.intent.action.CLOSE_SYSTEM_DIALOGS >/dev/null 2>&1 || true

adb logcat -c
adb logcat -v threadtime > "$OUT/logcat.txt" 2>&1 &
LOGCAT_PID=$!

shot() {
  sleep 3
  adb exec-out screencap -p > "$OUT/shots/$1.png" || true
}

notifications() {
  echo "── $1" >> "$OUT/notifications.txt"
  adb shell dumpsys notification --noredact | grep -E "pkg=$PKG|android.title=|android.text=" | grep -A2 "pkg=$PKG" >> "$OUT/notifications.txt" || true
}

# Data-only FCM message, as the Kushi API sends them.
push() {
  adb shell am broadcast -a com.google.android.c2dm.intent.RECEIVE -p "$PKG" \
    --es google.message_id "smoke-$RANDOM" --es from 1 --es google.delivered_priority high \
    --es google.original_priority high "$@"
}

# ── UI: sign in, browse, photo upload, chat, calls ──
(
  cd "$OUT"
  maestro test "$HERE/smoke.yaml" --format junit --output report.xml \
    || maestro test "$HERE/smoke.yaml" --format junit --output report.xml \
    || echo "SMOKE_FAILED=maestro" >> "$GITHUB_ENV"
  cp -R ~/.maestro/tests ./maestro 2>/dev/null || true
)

# ── Pushes ──
adb shell am start -n "$PKG/.MainActivity" >/dev/null; sleep 8
push --es intent notification --es id smoke-foreground
shot 20-push-foreground
# With a sender photo (chat pushes without one hit a largeIcon validation error in the app).
push --es intent notification --es id smoke-foreground-2 --es gcm.notification.title "Smoke"   --es gcm.notification.body "Foreground chat push" --es gcm.notification.image "$IMG"
shot 20b-push-foreground-image
notifications foreground

adb shell input keyevent KEYCODE_HOME; sleep 4
push --es intent notification --es id smoke-background
push --es intent notification --es id smoke-background-2 --es gcm.notification.title "Smoke"   --es gcm.notification.body "Background chat push" --es gcm.notification.image "$IMG"
adb shell cmd statusbar expand-notifications; shot 21-push-background
adb shell cmd statusbar collapse
notifications background

adb shell am kill "$PKG"; sleep 4
echo "pid after kill: $(adb shell pidof $PKG)" >> "$OUT/notifications.txt"
push --es intent notification --es id smoke-killed
push --es intent notification --es id smoke-killed-2 --es gcm.notification.title "Smoke"   --es gcm.notification.body "Killed-state chat push" --es gcm.notification.image "$IMG"
sleep 10
adb shell cmd statusbar expand-notifications; shot 22-push-killed
adb shell cmd statusbar collapse
notifications killed

push --es intent voice-call --es chatId smoke-call --es callId smoke-call --es caller "Smoke Test"
sleep 6; shot 23-incoming-call
notifications incoming-call
push --es intent cancel_call --es chatId smoke-call --es callId smoke-call
sleep 5; shot 24-call-cancelled
notifications call-cancelled

sleep 5
kill $LOGCAT_PID 2>/dev/null || true

# ── Crash / R8 scan ──
APP_PIDS=$(grep -oE "Start proc [0-9]+:$PKG[/ ]" "$OUT/logcat.txt" | grep -oE "[0-9]+" | sort -u | tr '\n' '|' | sed 's/|$//')
echo "app pids: $APP_PIDS" > "$OUT/crashes.txt"
grep -E " ($APP_PIDS) " "$OUT/logcat.txt" | grep -nE "FATAL EXCEPTION|Fatal signal|ClassNotFoundException|NoClassDefFoundError|NoSuchMethodError|NoSuchFieldError|AbstractMethodError|IncompatibleClassChangeError|VerifyError|JNI DETECTED ERROR|Unable to instantiate|Unable to start (service|receiver)|ProGuard" \
  | grep -vE "SentryAndroidGradlePlugin" > "$OUT/r8-suspects.txt" || true
grep -nE -A25 "FATAL EXCEPTION|Fatal signal" "$OUT/logcat.txt" >> "$OUT/crashes.txt" || true
grep -nE "ReactNativeJS|ReactNative" "$OUT/logcat.txt" | grep -iE " E |error|exception" > "$OUT/js-errors.txt" || true

echo "── R8 suspects ($(wc -l < "$OUT/r8-suspects.txt") lines)"; head -60 "$OUT/r8-suspects.txt"
echo "── Notifications"; cat "$OUT/notifications.txt"
if grep -qE "FATAL EXCEPTION|Fatal signal" "$OUT/logcat.txt"; then
  echo "SMOKE_FAILED=crash" >> "$GITHUB_ENV"
fi
exit 0
