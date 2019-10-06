import compression from 'compression';
import helmet from 'helmet';
import WebhooksApi from '@octokit/webhooks';
import EventSource from 'eventsource';
import app from './app';
import log from './lib/logger';
import { NODE_ENV, PORT, SECRET } from './config';

app.use(helmet()); // set well-known security-related HTTP headers
app.use(compression());

app.disable('x-powered-by');

const port: String = PORT || '4000';
const webhooks = new WebhooksApi({
    secret: 'santa' // TODO: use from .env file
});

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

webhooks.on('*', ({id, name, payload }) => {
    console.log(name, 'event received');
    log.info(`Received event '${name}' at ${new Date().toUTCString()}`);
});

const server = app.listen(port, () => {
    console.log(`🚀 Server started on http://localhost:${port}`);
});

export default server;
