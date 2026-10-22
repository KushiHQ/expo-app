# Kushi R8 keep rules, appended to android/app/proguard-rules.pro by
# expo-build-properties (app.config.js → extraProguardRules).
#
# Already covered by the libraries' own consumer rules, so not repeated here:
# React Native (every NativeModule, @ReactProp, @DoNotStrip, JNI natives),
# Expo modules (incl. modules/lock-screen-manager), Notifee, org.webrtc (Daily's
# WebRTC), Firebase, Play Services, media3, Sentry, Reanimated/Worklets, SVG.

# Keep line numbers so Sentry shows real lines once the mapping is applied.
-keepattributes SourceFile,LineNumberTable,Signature,InnerClasses,EnclosingMethod,*Annotation*
-renamesourcefileattribute SourceFile

# Nitro (VisionCamera, nitro-image, face detector): C++ looks classes and
# methods up over JNI by name.
-keep class com.margelo.nitro.** { *; }
-keep class com.mrousavy.camera.** { *; }

# react-native-webrtc's Java side (Daily) is called from native code.
-keep class com.oney.WebRTCModule.** { *; }
-keep class com.daily.reactlibrary.** { *; }

# react-native-callkeep: ConnectionService + its event plumbing.
-keep class io.wazo.callkeep.** { *; }

# Notifee's prebuilt core is looked up reflectively from the RN bridge.
-keep class app.notifee.core.** { *; }
-keep class io.invertase.notifee.** { *; }

# React Native Firebase messaging: headless JS task + receiver/service.
-keep class io.invertase.firebase.** { *; }

# react-native-pdf: pdfium JNI calls back into these classes; the table of
# contents is serialised with Gson.
-keep class io.legere.pdfiumandroid.** { *; }
-keep class com.github.barteksc.pdfviewer.** { *; }
-keep class org.wonday.pdf.** { *; }

# react-native-image-crop-picker → uCrop (native variant uses JNI).
-keep class com.yalantis.ucrop.** { *; }
-keep interface com.yalantis.ucrop.** { *; }
-dontwarn com.yalantis.ucrop.**

# WebView JS bridges (react-native-webview, Flutterwave checkout).
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Sentry's RN layer.
-keep class io.sentry.react.** { *; }
