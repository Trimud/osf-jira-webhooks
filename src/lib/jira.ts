import JiraApi from 'jira-client';
import log from './logger';
import { JIRA_PROTOCOL, JIRA_HOST, JIRA_BASE, JIRA_USERNAME, JIRA_PASSWORD, JIRA_API_VERSION,  } from '../config';

// Initialize JIRA client
const jira = new JiraApi({
    protocol: JIRA_PROTOCOL,
    host: 'dev.osf-global.com', // TODO: Use JIRA_HOST from .env
    base: JIRA_BASE,
    username: JIRA_USERNAME,
    password: JIRA_PASSWORD,
    apiVersion: JIRA_API_VERSION
});

export const findIssue = async (issueNumber: string) => {
    try {
        const issue = await jira.findIssue(issueNumber);

        return true;
    } catch (err) {
        log.error(`JIRA findIssue error: ${JSON.stringify(err.message)}`);

        return false;
    }
}

export const listTransitions = async (issueNumber: string) => {
    try {
        const response = await jira.listTransitions(issueNumber);
        let arr = new Array();

        for (const transition of response.transitions) {
            arr.push(transition.id);
        }

        return arr;
    } catch (err) {
        console.error(err);
    }
}

export const transitionIssue = async (issueNumber: string, issueTransition: object) => {
    try {
        await jira.transitionIssue(issueNumber, issueTransition);
        console.log(`${issueNumber} has been transitioned successfully.`);
    } catch (err) {
        console.error(err);
    }
}
