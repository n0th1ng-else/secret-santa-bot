export const appPort: number = Number(process.env.PORT) || 3000;

export const appVersion: string = process.env.APP_VERSION || "dev";

export const enableSSL = process.env.ENABLE_SSL === "true";

export const selfUrl: string = process.env.SELF_URL || "";

export const nextReplicaUrl: string = process.env.NEXT_REPLICA_URL || "";

export const replicaLifecycleInterval: number =
  Number(process.env.REPLICA_LIFECYCLE_INTERVAL_DAYS) || 1;

export const telegramBotApi: string = process.env.TELEGRAM_BOT_API || "";

export const telegramBotName: string = process.env.TELEGRAM_BOT_NAME || "";

export const ngRokToken: string = process.env.NGROK_TOKEN || "";

export const authorTelegramAccount: string =
  process.env.AUTHOR_TELEGRAM_ACCOUNT || "";

export const logApi = {
  apiToken: process.env.LOG_API_TOKEN || "",
  projectId: process.env.LOG_PROJECT_ID || "",
};

export const memoryLimit = Number(process.env.MEMORY_LIMIT_MB) || 0;

export const clusterSize = Number(process.env.CLUSTER_SIZE) || 1;

export const launchTime =
  Number(process.env.LAUNCH_TIME) || new Date().getTime();

export const dbPostgres = {
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  host: process.env.DB_HOST || "",
  database: process.env.DB_DATABASE || "",
  port: Number(process.env.DB_PORT) || 5432,
};

export const analyticsId = process.env.GA_TRACKING_ID || "";
