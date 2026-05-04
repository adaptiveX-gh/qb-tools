import QuickBooks from "node-quickbooks";
import OAuthClient from "intuit-oauth";

type Environment = "sandbox" | "production";

export interface QuickbooksClientConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  realmId: string;
  environment: string;
  redirectUri: string;
}

export interface TokenSnapshot {
  refreshToken: string;
  realmId: string;
  accessToken: string;
  accessTokenExpiry: number; // epoch ms
}

export class QuickbooksClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private refreshToken: string;
  private realmId: string;
  private readonly environment: string;
  private accessToken?: string;
  private accessTokenExpiry?: Date;
  private quickbooksInstance?: any;
  private oauthClient: OAuthClient;
  private readonly redirectUri: string;
  private _tokensChanged = false;

  // Shared in-flight refresh promise so concurrent callers await the same request
  private refreshInFlight?: Promise<{ access_token: string; expires_in: number }>;

  constructor(config: QuickbooksClientConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.refreshToken = config.refreshToken;
    this.realmId = config.realmId;
    this.environment = config.environment;
    this.redirectUri = config.redirectUri;
    this.oauthClient = new OAuthClient({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      environment: this.environment as Environment,
      redirectUri: this.redirectUri,
    });
  }

  /** Generate the Intuit OAuth authorization URL */
  getAuthorizationUrl(state: string): string {
    return this.oauthClient
      .authorizeUri({
        scope: [OAuthClient.scopes.Accounting as string],
        state,
      })
      .toString();
  }

  /** Exchange an authorization code for tokens */
  async exchangeCode(callbackUrl: string): Promise<TokenSnapshot> {
    const response = await this.oauthClient.createToken(callbackUrl);
    const token = response.token as unknown as {
      access_token: string;
      refresh_token: string;
      expires_in?: number;
      realmId: string;
    };

    this.refreshToken = token.refresh_token;
    this.realmId = token.realmId;
    this.accessToken = token.access_token;
    const expiresIn = token.expires_in || 3600;
    this.accessTokenExpiry = new Date(Date.now() + expiresIn * 1000);

    return {
      refreshToken: this.refreshToken,
      realmId: this.realmId,
      accessToken: this.accessToken,
      accessTokenExpiry: this.accessTokenExpiry.getTime(),
    };
  }

  async refreshAccessToken() {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = (async () => {
      try {
        const authResponse = await this.oauthClient.refreshUsingToken(this.refreshToken);
        const token = authResponse.token as unknown as {
          access_token: string;
          expires_in?: number;
          refresh_token?: string;
          x_refresh_token_expires_in?: number;
        };

        this.accessToken = token.access_token;
        const expiresIn = token.expires_in || 3600;
        this.accessTokenExpiry = new Date(Date.now() + expiresIn * 1000);

        // Handle token rotation
        const newRefreshToken = token.refresh_token;
        if (newRefreshToken && newRefreshToken !== this.refreshToken) {
          this.refreshToken = newRefreshToken;
          this._tokensChanged = true;
          console.error("[qb-client] Refresh token rotated");
        }

        // Warn if refresh token is expiring soon
        const refreshExpiresIn = token.x_refresh_token_expires_in;
        if (typeof refreshExpiresIn === "number" && refreshExpiresIn < 14 * 24 * 3600) {
          const days = Math.round(refreshExpiresIn / 86400);
          console.error(`[qb-client] WARNING: refresh token expires in ~${days} day(s).`);
        }

        return { access_token: this.accessToken!, expires_in: expiresIn };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to refresh QuickBooks token: ${message}`);
      } finally {
        this.refreshInFlight = undefined;
      }
    })();

    return this.refreshInFlight;
  }

  async authenticate() {
    const now = new Date();
    if (!this.accessToken || !this.accessTokenExpiry || this.accessTokenExpiry <= now) {
      const tokenResponse = await this.refreshAccessToken();
      this.accessToken = tokenResponse.access_token;
    }

    this.quickbooksInstance = new (QuickBooks as any)(
      this.clientId,
      this.clientSecret,
      this.accessToken,
      false, // no token secret for OAuth 2.0
      this.realmId,
      this.environment === "sandbox",
      false, // debug
      null, // minor version
      "2.0", // oauth version
      this.refreshToken
    );

    return this.quickbooksInstance;
  }

  getQuickbooks() {
    if (!this.quickbooksInstance) {
      throw new Error("QuickBooks not authenticated. Call authenticate() first");
    }
    return this.quickbooksInstance;
  }

  /** Returns true if tokens were rotated during this session */
  tokensChanged(): boolean {
    return this._tokensChanged;
  }

  /** Get current token state for session persistence */
  getTokenSnapshot(): TokenSnapshot {
    return {
      refreshToken: this.refreshToken,
      realmId: this.realmId,
      accessToken: this.accessToken || "",
      accessTokenExpiry: this.accessTokenExpiry?.getTime() || 0,
    };
  }
}
