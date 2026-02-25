export type UnknownRecord = Record<string, unknown>;

export interface LoggerLike {
  error?: (message: string) => void;
  debug?: (message: string) => void;
}

export interface AttributeLike {
  customField?: string;
  regex?: string;
  maxLength?: number;
  minLength?: number;
  type?: string;
  [key: string]: unknown;
}

export interface ModelLike {
  uid: string;
  attributes?: Record<string, AttributeLike>;
  [key: string]: unknown;
}

export interface LifecycleEvent {
  model?: {
    uid?: string;
  };
  params: {
    data?: UnknownRecord;
  };
  result?: unknown;
}

export interface LifecycleSubscription {
  models: string[];
  beforeCreate?: (event: LifecycleEvent) => Promise<void> | void;
  beforeUpdate?: (event: LifecycleEvent) => Promise<void> | void;
  afterFindOne?: (event: LifecycleEvent) => Promise<void> | void;
  afterFindMany?: (event: LifecycleEvent) => Promise<void> | void;
}

export interface KoaContextLike {
  body?: unknown;
}

export type KoaNextLike = () => Promise<void>;
export type KoaMiddlewareLike = (
  ctx: KoaContextLike,
  next: KoaNextLike
) => Promise<void>;

export interface StrapiLike {
  config?: {
    get?: (key: string) => unknown;
  };
  log?: LoggerLike;
  contentTypes: Record<string, ModelLike>;
  components: Record<string, ModelLike>;
  getModel: (uid: string) => ModelLike | undefined;
  db: {
    lifecycles: {
      subscribe: (subscription: LifecycleSubscription) => void;
    };
  };
  server: {
    use: (middleware: KoaMiddlewareLike) => void;
  };
  customFields: {
    register: (field: { name: string; plugin: string; type: string }) => void;
  };
}
