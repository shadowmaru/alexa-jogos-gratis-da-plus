/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const request = require('request-promise');
const $ = require('cheerio');

const FreeGamesHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'FreeGamesIntent');
  },
  handle(handlerInput) {
    const host = "https://store.playstation.com";
    const url = `${host}/pt-br/home/games/psplus`;

    const link = request(url).
      then(function(error, response, html) {
        if(!error){
          // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

          return $('a:contains("Jogos Gratuitos")', html).attr('href');
        }
      }).
      then(function(link) {
        request(link).
          then(function(error, response, html) {
            if(!error) {
              const games = $('.grid-cell-container div.ember-view .grid-cell-row__container', html).map(function(el) {
                return $('.grid-cell__title', el).text();
              });
              return games;
            }
          })
      });

    const freeGames="<lang xml:lang='en-US'>Borderlands: The Handsome Collection</lang> e <lang xml:lang='en-US'>Sonic Mania</lang>";
    const speechOutput = FREE_GAMES_MESSAGE + games;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      // .withSimpleCard(SKILL_NAME, randomFact)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Desculpe, aconteceu um erro')
      .reprompt('Desculpe, aconteceu um erro')
      .getResponse();
  },
};

const SKILL_NAME = 'PS Plus';
const FREE_GAMES_MESSAGE = 'Aqui estão os jogos grátis deste mês: ';
const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    FreeGamesHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

