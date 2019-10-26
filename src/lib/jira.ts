import JiraApi from 'jira-client';
import log from './logger';
import { NODE_ENV } from '../config';
import { JIRA } from '../config';

// Initialize JIRA client
const jira = new JiraApi({
    protocol: JIRA.PROTOCOL,
    host: JIRA.HOST as string,
    base: JIRA.BASE,
    username: JIRA.USERNAME,
    password: JIRA.PASSWORD,
    apiVersion: JIRA.API_VERSION
});

// Get JIRA issue by number
export const findIssue = async (issueNumber: string) => {
    try {
        await jira.findIssue(issueNumber);

        return true;
    } catch (err) {
        log.error(`JIRA findIssue() error: ${JSON.stringify(err.message)}`);
        if (NODE_ENV === 'development') {
            console.log(err);
        }

        return false;
    }
}

// List Transitions for a specific issue that are available for the current ticket
export const listTransitions = async (issueNumber: string) => {
    try {
        const response = await jira.listTransitions(issueNumber);
        let arr = new Array();

        for (const transition of response.transitions) {
            arr.push(transition.id);
        }

        return arr;
    } catch (err) {
        log.error(`JIRA listTransitions() error: ${JSON.stringify(err.message)}`);
        if (NODE_ENV === 'development') {
            console.log(err);
        }
    }
}

// Transition issue to selected issue status
export const transitionIssue = async (issueNumber: string, issueTransition: object) => {
    try {
        await jira.transitionIssue(issueNumber, issueTransition);
        if (NODE_ENV === 'development') {
            console.log(`${issueNumber} has been transitioned successfully.`);
        }
    } catch (err) {
        log.error(`JIRA transitionIssue() error: ${JSON.stringify(err.message)}`);
        if (NODE_ENV === 'development') {
            console.log(err);
        }
    }
}
