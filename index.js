/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const req = require('request-promise');
const $ = require('cheerio');

const FREE_GAMES_MESSAGE = 'Aqui estão os jogos grátis deste mês: ';
const HELP_MESSAGE = 'Você pode perguntar quais são os jogos grátis deste mês... Como posso ajudar?';
const HELP_REPROMPT = 'Como posso ajudar?';
const STOP_MESSAGE = 'Tchau!';

const getFreeGames = async (link) => {
  try {
    const response = await req(link);
    const freeGames = [];

    return await new Promise((resolve) => {
      const cells = $(
        'div[data-qa-view-index=1] section.psw-product-tile__details > span.psw-t-body',
        response,
      );
      const games = cells.map((index, el) => $(el).text().replace('&', 'and').replace('®', ''));

      games.each((index) => {
        freeGames.push(games[index]);
      });

      const filteredGames = freeGames
        .filter((game) => game !== '')
        .filter((game) => !game.endsWith('Subscription'))
        .filter((game) => !game.startsWith('Assinatura'));

      resolve(filteredGames);
    });
  } catch (error) {
    console.log(`Error when fetching games: ${error}`);
  }
};

const FreeGamesHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return (
      request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'FreeGamesIntent')
    );
  },
  async handle(handlerInput) {
    const host = 'https://store.playstation.com';
    const url = `${host}/pt-br/subscriptions`;
    const freeGames = await getFreeGames(url);

    const freeGamesSpeech = freeGames
      .map((game) => `<lang xml:lang='en-US'>${game}</lang>`)
      .join(', ');
    const speechOutput = FREE_GAMES_MESSAGE + freeGamesSpeech;

    return handlerInput.responseBuilder.speak(speechOutput).getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return (
      request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent'
    );
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
    const { request } = handlerInput.requestEnvelope;
    return (
      request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(STOP_MESSAGE).getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`,
    );

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

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    FreeGamesHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
