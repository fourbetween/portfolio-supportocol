import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AUTH_USERPOOL_ID,
      userPoolClientId: import.meta.env.VITE_AUTH_USERPOOL_CLIENT_ID,
      signUpVerificationMethod: "link",
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_AUTH_DOMAIN,
          scopes: ["openid", "profile", "email"],
          redirectSignIn: [import.meta.env.VITE_AUTH_REDIRECT_SIGN_IN],
          redirectSignOut: [import.meta.env.VITE_AUTH_REDIRECT_SIGN_OUT],
          responseType: "code",
        },
      },
    },
  },
});
