import http from 'http';
import WebhooksApi from '@octokit/webhooks';
import EventSource from 'eventsource';
import log from './lib/logger';
import { NODE_ENV, PORT, SECRET, TRANSITION_IDS } from './config';
import { Transition } from './lib/webhooks/transitionIssue';

const port: String = PORT || '4000';
const ticketRegex: RegExp = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/g;
const webhooks = new WebhooksApi({
    secret: SECRET as string
});

// Run ExpressJS server
// const app = express();
// app.use(helmet()); // set well-known security-related HTTP headers
// app.use(compression()); // Node.js compression middleware
// app.use(webhooks.middleware); // use Webhooks middleware

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
if (NODE_ENV === 'development') {
    webhooks.on('*', ({id, name, payload }) => {
        console.log(`Webhooks: Received '${name}' event with id '${id}'`);
    });
}

// Push webhook is triggered on pushed commit to the repo
// Change JIRA ticket status to 'IN PROGRESS'
webhooks.on('push', async ({id, name, payload }) => {
    const commitMessage = payload.commits[0].message;
    const ticketIDArr = commitMessage.match(ticketRegex);
    const TRANSITION_ID = TRANSITION_IDS.IN_PROGRESS; // The transition id from your Jira workflow

    // Exit if there are no ticket numbers written in commit message
    if (!ticketIDArr) return;

    let tr = new Transition(TRANSITION_ID as string, ticketIDArr);
    tr.transitionJIRATicket();
});

// pull_request webhook is triggered when PR is opened
// Change JIRA ticket status to 'AWAITING REVIEW'
webhooks.on('pull_request', async ({id, name, payload }) => {
    const pullRequestTitle = payload.pull_request.title;
    const pullRequestBranch = payload.pull_request.head.ref;
    let ticketIDArr = pullRequestTitle.match(ticketRegex);
    let TRANSITION_ID = TRANSITION_IDS.AWAITING_REVIEW; // defaults to payload.action === 'opened'

    if (payload.action === 'closed') {
        TRANSITION_ID = TRANSITION_IDS.APPROVE_REVIEW; // defaults to payload.pull_request.merged === true

        if (payload.pull_request.merged === false) {
            TRANSITION_ID = TRANSITION_IDS.REJECT_REVIEW;
        }
    }

    // Exit if no ticket number is found in PR title
    if (ticketIDArr === null) return;

    if (!ticketIDArr.length && pullRequestBranch.match(ticketRegex).length > 0) {
        ticketIDArr = pullRequestBranch.match(ticketRegex);
    }

    // Exit if there are no ticket IDs found either in commit message or in branch name
    if (!ticketIDArr.length) return;

    let tr = new Transition(TRANSITION_ID as string, ticketIDArr);
    tr.transitionJIRATicket();
});

// Log errors
webhooks.on('error', (error) => {
    log.error(`Error ocurred in "${error.name} handler: ${error.stack}"`)
});

const server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end(`Server started on port ${port}`)
}).listen(port, () => {
    console.log(`Server started on port ${port}`)
});;

server.on('request', webhooks.middleware);
