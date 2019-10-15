import * as dotenv from "dotenv";

dotenv.config();

export const TRANSITION_IDS = {
	IN_PROGRESS: process.env.TRANSITION_IN_PROGRESS,
	AWAITING_REVIEW: process.env.TRANSITION_AWAITING_REVIEW
}
export const JIRA = {
	PROTOCOL: process.env.JIRA_PROTOCOL,
	HOST: process.env.JIRA_HOST,
	BASE: process.env.JIRA_BASE,
	USERNAME: process.env.JIRA_USERNAME,
	PASSWORD: process.env.JIRA_PASSWORD,
	API_VERSION: process.env.JIRA_API_VERSION,
	STRICT_SSL: process.env.JIRA_STRICT_SSL
}
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const SECRET = process.env.SECRET;
