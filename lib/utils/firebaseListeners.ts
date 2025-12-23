import messaging from "@react-native-firebase/messaging";
import notifee from "@notifee/react-native";
import {
  isFirebaseStreamVideoMessage,
  firebaseDataHandler,
  onAndroidNotifeeEvent,
  isNotifeeStreamVideoEvent,
} from "@stream-io/video-react-native-sdk";

export const setFirebaseListeners = () => {
  messaging().setBackgroundMessageHandler(async (msg) => {
    if (isFirebaseStreamVideoMessage(msg)) {
      await firebaseDataHandler(msg.data);
    } else {
      // your other background notifications (if any)
    }
  });

  notifee.onBackgroundEvent(async (event) => {
    if (isNotifeeStreamVideoEvent(event)) {
      await onAndroidNotifeeEvent({ event, isBackground: true });
    } else {
      // your other background notifications (if any)
    }
  });

  messaging().onMessage((msg) => {
    if (isFirebaseStreamVideoMessage(msg)) {
      firebaseDataHandler(msg.data);
    } else {
      // your other foreground notifications (if any)
    }
  });
  notifee.onForegroundEvent((event) => {
    if (isNotifeeStreamVideoEvent(event)) {
      onAndroidNotifeeEvent({ event, isBackground: false });
    } else {
      // your other foreground notifications (if any)
    }
  });
};
