#!/usr/bin/env bash
# Photo tour playback check, run inside the emulator by
# .github/workflows/android-video-check.yml. Installs the release APK, opens a
# live listing's tour from a shared link (kushi://hostings/<id>?tour=1), taps
# play, and keeps screenshots, logcat and the audio/media state.
#
# Usage: video.sh <apk> <out-dir> [hosting-id]
set -u
APK="$1"
OUT="$2"
ID="${3:-a05781bf-128c-4d71-a2a3-61237f75ecf8}"
PKG=com.kushicorp.kushi
mkdir -p "$OUT"

adb wait-for-device
sleep 5
adb install -r -g "$APK" || { echo "install failed"; exit 0; }
sleep 30
adb shell am broadcast -a android.intent.action.CLOSE_SYSTEM_DIALOGS >/dev/null 2>&1 || true

adb logcat -c
adb logcat -v threadtime > "$OUT/logcat.txt" 2>&1 &
LOGCAT_PID=$!
shot() { adb exec-out screencap -p > "$OUT/$1.png" || true; }

SIZE=$(adb shell wm size | grep -oE '[0-9]+x[0-9]+' | tail -1)
CX=$(( ${SIZE%x*} / 2 ))
CY=$(( ${SIZE#*x} / 2 ))

adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
sleep 25
shot 01-launch

adb shell am start -a android.intent.action.VIEW -d "kushi://hostings/$ID?tour=1" "$PKG" >/dev/null
sleep 30
shot 02-tour-open
sleep 8
shot 03-tour-8s-later

adb shell input tap "$CX" "$CY"
sleep 10
shot 04-after-tap
sleep 10
shot 05-after-tap-20s

adb shell dumpsys media_session > "$OUT/media_session.txt" 2>&1 || true
adb shell dumpsys audio > "$OUT/audio.txt" 2>&1 || true
kill "$LOGCAT_PID" 2>/dev/null || true
grep -iE "ExoPlayer|PlaybackException|MediaCodec|AudioTrack|AudioSink|tour-player|expo.modules.video|VideoPlayer|AndroidRuntime|FATAL|ReactNativeJS" "$OUT/logcat.txt" > "$OUT/video-log.txt" || true
echo "── video log (head)"
head -150 "$OUT/video-log.txt"
