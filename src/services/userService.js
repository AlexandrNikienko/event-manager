import { db, auth } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const userService = {
  async getUserDoc() {
    const user = auth.currentUser;
    console.log("getUserDoc", user);
    if (!user) throw new Error("User not authorized");
    return doc(db, "users", user.uid);
  },

  async getSettings() {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authorized");

    // ✅ Use `doc`, not `collection`
    const settingsDoc = doc(db, "users", user.uid, "settings", "default");
    const snapshot = await getDoc(settingsDoc);

    return snapshot.exists() ? snapshot.data() : {};
  },

  async updateSettings(newSettings) {
    console.log("updateSettings with", newSettings);

    const user = auth.currentUser;
    if (!user) throw new Error("User not authorized");

    // ✅ Same fix here
    const settingsDoc = doc(db, "users", user.uid, "settings", "default");
    await setDoc(settingsDoc, newSettings, { merge: true });
  }
};
