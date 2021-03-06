import { Pool, types as PGTypes, defaults as PGDefaults } from "pg";
import { Logger } from "../logger";
import { flattenPromise } from "../common/helpers";
import { UsersClient } from "./users";
import { NodesClient } from "./nodes";
import { RelationsClient } from "./relations";
import { EventsClient } from "./events";
import { WizardsClient } from "./wizards";

const logger = new Logger("postgres-client");

interface DbConnectionConfig {
  user: string;
  password: string;
  host: string;
  database: string;
  port: number;
}

export class DbClient {
  public readonly users: UsersClient;
  public readonly nodes: NodesClient;
  public readonly relations: RelationsClient;
  public readonly events: EventsClient;
  public readonly wizards: WizardsClient;

  private readonly initialized: boolean;

  private static getPool(config: DbConnectionConfig): Pool {
    return new Pool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port,
      max: 1,
    });
  }

  constructor(config: DbConnectionConfig, pool = DbClient.getPool(config)) {
    this.initialized = Object.values(config).every((val) => val);
    if (!this.initialized) {
      logger.error(
        "Missing connection data for postgres server. Check the config"
      );
    }

    this.setDefaults();
    this.setParsers();

    this.nodes = new NodesClient(pool);
    this.users = new UsersClient(pool);
    this.relations = new RelationsClient(pool);
    this.events = new EventsClient(pool);
    this.wizards = new WizardsClient(pool);
  }

  public init(): Promise<void> {
    if (!this.initialized) {
      return Promise.resolve();
    }

    return Promise.all([
      this.nodes.init(),
      this.users.init(),
      this.relations.init(),
      this.events.init(),
      this.wizards.init(),
    ]).then(flattenPromise);
  }

  public setClientName(threadId: number): this {
    PGDefaults.application_name = `bot sql stream for replica ${threadId}`;
    return this;
  }

  private setParsers(): void {
    PGTypes.setTypeParser(PGTypes.builtins.INT8, (val) => parseInt(val));
  }

  private setDefaults(): void {
    PGDefaults.poolSize = 1;
  }
}
