import auth0 from "auth0-js";
import history from "../history";

const PUBLIC_ENDPOINT = process.env.REACT_APP_PUBLIC_ENDPOINT || "";
const PRIVATE_ENDPOINT = process.env.REACT_APP_PRIVATE_ENDPOINT || "";
const LOGGEDIN_URL = process.env.REACT_APP_LOGGEDIN_URL || "";

export const KEY_USER_ROLE = "user_role";

export default class Auth {
  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: process.env.REACT_APP_AUTH0_DOMAIN,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      redirectUri: process.env.REACT_APP_AUTH0_CALLBACK_URL,
      audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/userinfo`,
      responseType: "token id_token",
      scope: "openid"
    });

    const metadataNamespace = process.env.REACT_APP_AUTH_METADATA_NAMESPACE;
    const metadataRole = process.env.REACT_APP_AUTH_METADATA_ROLE;
    this.metadataKeyUserRole = metadataNamespace + metadataRole;

    this.userRole = undefined;

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.setProfile = this.setProfile.bind(this);
    this.hasFacilitatorPriviledge = this.hasFacilitatorPriviledge.bind(this);
    this.hasDriverPriviledge = this.hasDriverPriviledge.bind(this);
    this.hasAdminPriviledge = this.hasAdminPriviledge.bind(this);
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        history.replace("/");
        console.log(err);
      }
    });
  }

  setSession(authResult) {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );

    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);

    this.getProfile();
  }

  getProfile() {
    const accessToken = this.getAccessToken();
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      this.setProfile(err, profile);
    });
  }

  getAccessToken() {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      throw new Error("No Access Token found");
    }
    return accessToken;
  }

  setProfile(error, profile) {
    const userRole = profile[this.metadataKeyUserRole];
    localStorage.setItem(KEY_USER_ROLE, (userRole || "").trim().toLowerCase());

    if (userRole === "facilitator") {
      history.replace("/facilitator");
    } else if (userRole === "driver") {
      history.replace("/driver");
    } else {
      history.replace("/");
    }
  }

  login() {
    try {
      this.auth0.authorize();
    } catch (error) {
      throw new Error(`Apologies, system is unable to process users log in.`);
    }
  }

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem(KEY_USER_ROLE);

    history.replace("/");
  }

  isAuthenticated() {
    const expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    return new Date().getTime() < expiresAt;
  }

  hasFacilitatorPriviledge() {
    const userRole = localStorage.getItem(KEY_USER_ROLE);
    return userRole === 'facilitator' || this.hasAdminPriviledge();
  }

  hasDriverPriviledge() {
    const userRole = localStorage.getItem(KEY_USER_ROLE);
    return userRole === "driver" || this.hasAdminPriviledge();
  }

  hasAdminPriviledge() {
    const userRole = localStorage.getItem(KEY_USER_ROLE);
    return userRole === "admin";
  }
}
