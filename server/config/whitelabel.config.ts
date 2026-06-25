/**
 * White-Label Configuration
 *
 * Centraliza configurações do sistema multi-tenant
 */

export interface WhitelabelConfig {
  // Domain configuration
  domains: {
    main: string[]; // Domínios principais (voxmation.com, voxmation.app)
    allowedTlds: string[]; // TLDs permitidas
  };

  // Cache configuration
  cache: {
    ttl: number; // Time-to-live em segundos
    checkperiod: number; // Período de verificação de expiração
    enabled: boolean;
  };

  // Security
  security: {
    requireActivAccount: boolean;
    validateHostname: boolean;
    allowIpAccess: boolean;
  };

  // Branding defaults
  branding: {
    defaultPrimaryColor: string;
    defaultSecondaryColor: string;
    defaultTertiaryColor: string;
    defaultCompanyName: string;
  };

  // Features enabled by plan
  featuresByPlan: Record<string, Record<string, boolean>>;

  // Limits by plan
  limitsByPlan: Record<
    string,
    {
      contacts?: number;
      callsPerMonth?: number;
      smsPerMonth?: number;
      teamMembers?: number;
      [key: string]: any;
    }
  >;

  // Logging
  logging: {
    enabled: boolean;
    verbose: boolean;
    logErrors: boolean;
  };
}

/**
 * Default Configuration
 */
export const defaultConfig: WhitelabelConfig = {
  domains: {
    main: ["voxmation.com", "voxmation.app", "voxmation.io"],
    allowedTlds: ["com", "app", "io", "co", "de", "fr", "uk", "eu"],
  },

  cache: {
    ttl: 5 * 60, // 5 minutes
    checkperiod: 60, // 1 minute
    enabled: true,
  },

  security: {
    requireActivAccount: true,
    validateHostname: true,
    allowIpAccess: false,
  },

  branding: {
    defaultPrimaryColor: "#37ca37",
    defaultSecondaryColor: "#188bf6",
    defaultTertiaryColor: "#f59e0b",
    defaultCompanyName: "Voxmation",
  },

  featuresByPlan: {
    free: {
      crm: false,
      marketing: false,
      phone: false,
      sms: false,
      email: true,
      reports: false,
    },
    starter: {
      crm: true,
      marketing: false,
      phone: true,
      sms: false,
      email: true,
      reports: false,
    },
    pro: {
      crm: true,
      marketing: true,
      phone: true,
      sms: true,
      email: true,
      reports: true,
    },
    enterprise: {
      crm: true,
      marketing: true,
      phone: true,
      sms: true,
      email: true,
      reports: true,
    },
  },

  limitsByPlan: {
    free: {
      contacts: 100,
      callsPerMonth: 50,
      smsPerMonth: 0,
      teamMembers: 1,
    },
    starter: {
      contacts: 1000,
      callsPerMonth: 500,
      smsPerMonth: 100,
      teamMembers: 5,
    },
    pro: {
      contacts: 10000,
      callsPerMonth: 5000,
      smsPerMonth: 5000,
      teamMembers: 20,
    },
    enterprise: {
      contacts: 100000,
      callsPerMonth: 50000,
      smsPerMonth: 50000,
      teamMembers: 100,
    },
  },

  logging: {
    enabled: true,
    verbose: process.env.NODE_ENV === "development",
    logErrors: true,
  },
};

/**
 * Get configuration (merge with env vars)
 */
export function getWhitelabelConfig(
  overrides?: Partial<WhitelabelConfig>
): WhitelabelConfig {
  return {
    ...defaultConfig,
    ...overrides,
    domains: {
      ...defaultConfig.domains,
      ...(overrides?.domains || {}),
    },
    cache: {
      ...defaultConfig.cache,
      ...(overrides?.cache || {}),
    },
    security: {
      ...defaultConfig.security,
      ...(overrides?.security || {}),
    },
    branding: {
      ...defaultConfig.branding,
      ...(overrides?.branding || {}),
    },
    featuresByPlan: {
      ...defaultConfig.featuresByPlan,
      ...(overrides?.featuresByPlan || {}),
    },
    limitsByPlan: {
      ...defaultConfig.limitsByPlan,
      ...(overrides?.limitsByPlan || {}),
    },
    logging: {
      ...defaultConfig.logging,
      ...(overrides?.logging || {}),
    },
  };
}

/**
 * Configuration from environment variables
 */
export function getConfigFromEnv(): Partial<WhitelabelConfig> {
  return {
    cache: {
      ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 300,
      checkperiod: process.env.CACHE_CHECK_PERIOD
        ? parseInt(process.env.CACHE_CHECK_PERIOD)
        : 60,
      enabled: process.env.CACHE_ENABLED !== "false",
    },
    security: {
      requireActivAccount: process.env.REQUIRE_ACTIVE_ACCOUNT !== "false",
      validateHostname: process.env.VALIDATE_HOSTNAME !== "false",
      allowIpAccess: process.env.ALLOW_IP_ACCESS === "true",
    },
    logging: {
      enabled: process.env.LOG_ENABLED !== "false",
      verbose: process.env.LOG_VERBOSE === "true",
      logErrors: process.env.LOG_ERRORS !== "false",
    },
  };
}

/**
 * Get features for account
 */
export function getAccountFeatures(
  accountPlan: string,
  config: WhitelabelConfig
): Record<string, boolean> {
  return config.featuresByPlan[accountPlan] || config.featuresByPlan.free;
}

/**
 * Get limits for account
 */
export function getAccountLimits(
  accountPlan: string,
  config: WhitelabelConfig
): Record<string, any> {
  return config.limitsByPlan[accountPlan] || config.limitsByPlan.free;
}

/**
 * Validate plan
 */
export function isValidPlan(
  plan: string
): plan is "free" | "starter" | "pro" | "enterprise" {
  return ["free", "starter", "pro", "enterprise"].includes(plan);
}

/**
 * Feature matrix (for reference)
 */
export const featureMatrix = {
  free: ["email"],
  starter: ["email", "crm", "phone"],
  pro: ["email", "crm", "phone", "marketing", "sms", "reports"],
  enterprise: [
    "email",
    "crm",
    "phone",
    "marketing",
    "sms",
    "reports",
    "analytics",
    "webhooks",
    "api",
  ],
};

/**
 * Price (for reference)
 */
export const pricing = {
  free: 0,
  starter: 99,
  pro: 299,
  enterprise: "custom",
};
