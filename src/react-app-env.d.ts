declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_API_BASE_URL: string;
    readonly REACT_APP_ENV: "development" | "production" | "test";
  }
}
