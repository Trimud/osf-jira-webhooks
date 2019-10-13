import compression from 'compression';
import helmet from 'helmet';
import WebhooksApi from '@octokit/webhooks';
import EventSource from 'eventsource';
import app from './app';
import log from './lib/logger';
import { findIssue, listTransitions, transitionIssue } from './lib/jira';
import { NODE_ENV, PORT, TRANSITION_IDS } from './config';

const port: String = PORT || '4000';
const ticketRegex = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/g;
const webhooks = new WebhooksApi({
    secret: 'santa' // TODO: Use SECRET from .env vars
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

// Push webhook is triggered on pushed commit to the repo
// Change JIRA ticket status to 'IN PROGRESS'
webhooks.on('push', async ({id, name, payload }) => {
    const commitMessage = payload.commits[0].message;
    const ticketIDArr = commitMessage.match(ticketRegex);
    const TRANSITION_ID = TRANSITION_IDS.IN_PROGRESS; // The transition id from your Jira workflow

    log.info(`Webhooks: Received '${name}' event with id '${id}'`);

    // Exit if there are no ticket numbers written in commit message
    if (!ticketIDArr.length) return;

    for (const ticketID of ticketIDArr) {
        let hasValidTicketID = await findIssue(ticketID);

        if (!hasValidTicketID) {
            continue;
        }

        let transitionIDs = await listTransitions(ticketID);

        // Check if transition ID is valid based on available transitions
        // @ts-ignore: Object is possibly 'null'.
        let issueCanBeTransitioned = transitionIDs.includes(TRANSITION_ID);

        if (issueCanBeTransitioned) {
            let transitionObject = {
                transition: {
                    id: TRANSITION_ID
                }
            };

            transitionIssue(ticketID, transitionObject);
        }

    }
});

// pull_request webhook is triggered when PR is opened
// webhooks.on('pull_request', ({id, name, payload }) => {

// });

// Log errors
webhooks.on('error', (error) => {
    log.error(`Error ocurred in "${error.name} handler: ${error.stack}"`)
});

const server = app.listen(port, () => {
    console.log(`🚀 Server started on http://localhost:${port}`);
});

export default server;
