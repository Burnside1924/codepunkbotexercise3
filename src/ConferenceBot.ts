// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler } from 'botbuilder';
import { LuisRecognizer, QnAMaker } from 'botbuilder-ai';

export class ConferenceBot extends ActivityHandler {

    constructor(private qnaMaker: QnAMaker, private luis: LuisRecognizer) {
        super();

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello world!');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMessage(async (context, next) => {
            const qnaMakerResults = await this.qnaMaker.getAnswers(context);

            context.sendActivity(qnaMakerResults.length ? qnaMakerResults[0].answer : "No results found for your question");
            await next();
        });

        this.onUnrecognizedActivityType(async (context, next) => {
            await this.luis.recognize(context).then(r => {
                const top = LuisRecognizer.topIntent(r);
                context.sendActivity(`Intent, ${top}, found`)
            });

            await next();
        })
    }
}
