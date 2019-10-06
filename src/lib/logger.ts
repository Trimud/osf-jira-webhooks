import SimpleNodeLogger from 'simple-node-logger';

const opts = {
    errorEventName: 'error',
	logDirectory: './logs',
	fileNamePattern: 'logs-<DATE>.log',
	dateFormat: 'DD.MM.YYYY'
};

const log = SimpleNodeLogger.createRollingFileLogger( opts );

// Set log level
log.setLevel('all');

export default log;
