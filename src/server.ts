import compression from 'compression';
import helmet from 'helmet';
import WebhooksApi from '@octokit/webhooks';
import EventSource from 'eventsource';
import app from './app';
import log from './lib/logger';
import { NODE_ENV, PORT, SECRET, TRANSITION_IDS } from './config';
import { Transition } from './lib/webhooks/transitionIssue';

const port: String = PORT || '4000';
const ticketRegex = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/g;
const webhooks = new WebhooksApi({
    secret: SECRET as string
});

app.use(helmet()); // set well-known security-related HTTP headers
app.use(compression());

app.disable('x-powered-by');

// Use WebhookproxyURL 3rd party service
if (NODE_ENV === 'development') {
    const webhookProxyUrl = 'https://smee.io/fD79ZlPmi9S7L5sp';
    const source = new EventSource(webhookProxyUrl)
    source.onmessage = (event) => {
        const webhookEvent = JSON.parse(event.data)
        webhooks.verifyAndReceive({
            id: webhookEvent['x-request-id'],
            name: webhookEvent['x-github-event'],
            signature: webhookEvent['x-hub-signature'],
            payload: webhookEvent.body
        }).catch(console.error)
    }
}

// Log incoming webhook events
webhooks.on('*', ({id, name, payload }) => {
    if (NODE_ENV === 'development') {
        console.log(`Webhooks: Received '${name}' event with id '${id}'`);
    }

    // Store info in the logs
    log.info(`Webhooks: Received '${name}' event with id '${id}'`);
});

// Push webhook is triggered on pushed commit to the repo
// Change JIRA ticket status to 'IN PROGRESS'
webhooks.on('push', async ({id, name, payload }) => {
    const commitMessage = payload.commits[0].message;
    const ticketIDArr = commitMessage.match(ticketRegex);
    const TRANSITION_ID = TRANSITION_IDS.IN_PROGRESS; // The transition id from your Jira workflow

    // Exit if there are no ticket numbers written in commit message
    if (!ticketIDArr.length) return;

    let tr = new Transition(TRANSITION_ID as string, ticketIDArr);
    tr.transitionJIRATicket();
});

// pull_request webhook is triggered when PR is opened
webhooks.on('pull_request', async ({id, name, payload }) => {
    const pullRequestTitle = payload.pull_request.title;
    const pullRequestBranch = payload.pull_request.head.ref;
    let ticketIDArr = pullRequestTitle.match(ticketRegex);
    const TRANSITION_ID = TRANSITION_IDS.AWAITING_REVIEW; // The transition id from your Jira workflow

    if (!ticketIDArr.length && pullRequestBranch.match(ticketRegex).length > 0) {
        ticketIDArr = pullRequestBranch.match(ticketRegex);
    }

    // Exit if there are no ticket IDs found either in commit message or branch name
    if (!ticketIDArr.length) return;

    let tr = new Transition(TRANSITION_ID as string, ticketIDArr);
    tr.transitionJIRATicket();
});

// Log errors
webhooks.on('error', (error) => {
    log.error(`Error ocurred in "${error.name} handler: ${error.stack}"`)
});

const server = app.listen(port, () => {
    console.log(`🚀 Server started on http://localhost:${port}`);
});

export default server;
