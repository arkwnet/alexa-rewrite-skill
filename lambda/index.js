const Alexa = require('ask-sdk-core');
const https = require('https');
const url = require('url');

const textUrl = '';	// ここにURLを入力
const tutorialText = 'ウェブフォーム上で文章を書き換えた後に「こんにちは」と言って下さい。';

const httpget = function(u, postdata, headers) {
    return (new Promise(function(resolve, reject) {
        u = url.parse(u);
        let options = {
            host: u.hostname,
            path: u.path || '/'
        };
        if (u.port) {
            options.port = u.port;
        }
        if (url.username) {
            options.auth = u.auth;
        }
        if (typeof(postdata) !== 'undefined') {
            options.method = 'POST';
        }
        if (headers) {
            options.headers = headers;
        }
        var req = https.request(options, function(res) {
            let data = '';
            res.setEncoding = 'UTF-8';
            res.on('data', function(d) {
                data += d;
            });
            res.on('end', function() {
                resolve(data);
            });
        });
        req.on('connect', function(e) {
            console.log('connect');
        });
        req.on('error', function(e) {
            reject(e);
        });
        if (typeof(postdata) !== 'undefined') {
            req.write(postdata);
        }
        req.end();
    }));
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(tutorialText)
            .reprompt(tutorialText)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        return (httpget(textUrl).then(function(html) {
            return handlerInput.responseBuilder
                .speak(html)
                .reprompt(tutorialText)
                .getResponse();
        }));
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'スキルの起動時に指定のURLにアクセスし、取得した内容を話します。';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'さようなら!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `${intentName} のトリガーを実行しました。`;
        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `すみません。よく分かりませんでした。もう一度お試しください。`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .lambda();