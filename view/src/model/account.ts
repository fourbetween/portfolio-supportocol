import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";

export const accountMethods = {
  login: () => {
    signInWithRedirect({
      options: {
        lang: "ja",
      },
    });
  },
  logout: async () => {
    try {
      await signOut();
      console.log("Successfully logged out.");
    } catch (error) {
      console.error(error);
    }
  },
  isLoggedIn: async () => {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  },
  authHeader: async () => {
    const token = (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";
    return { Authorization: `Bearer ${token}` };
  },
};
