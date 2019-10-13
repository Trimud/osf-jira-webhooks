import * as dotenv from "dotenv";

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const SECRET = process.env.SECRET;
export const JIRA_PROTOCOL = process.env.JIRA_PROTOCOL;
export const JIRA_HOST = process.env.JIRA_HOST;
export const JIRA_BASE = process.env.JIRA_BASE;
export const JIRA_USERNAME = process.env.JIRA_USERNAME;
export const JIRA_PASSWORD = process.env.JIRA_PASSWORD;
export const JIRA_API_VERSION = process.env.JIRA_API_VERSION;
export const JIRA_STRICT_SSL = process.env.JIRA_STRICT_SSL;
