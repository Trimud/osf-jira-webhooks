import { findIssue, listTransitions, transitionIssue } from '../jira';

export class Transition {
    constructor(
        public transitionID: string,
        public ticketIDArr: Array<string>
    ) {
        this.transitionID = transitionID;
        this.ticketIDArr = ticketIDArr;
    }

    async transitionJIRATicket() {
        const arr = this.ticketIDArr;
        function* myGenerator(this: string) {
            while (arr.length) {
              yield arr.shift();
            }
        }
        let iterable = {
            [Symbol.iterator]: myGenerator
        };

        for (let ticketID of iterable) {
            let hasValidTicketID = await findIssue(ticketID as string);

            if (!hasValidTicketID) {
                continue;
            }

            let transitionIDs = await listTransitions(ticketID as string);

            // Check if transition ID is valid based on available transitions
            // @ts-ignore: Object is possibly 'null'.
            let issueCanBeTransitioned = transitionIDs.includes(this.transitionID);

            if (issueCanBeTransitioned) {
                let transitionObject = {
                    transition: {
                        id: this.transitionID
                    }
                };

                transitionIssue(ticketID as string, transitionObject);
            }
        }
    }
}
