/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const undici = require('undici');
const $ = require('cheerio').default;

const FREE_GAMES_MESSAGE = 'Aqui estão os jogos grátis deste mês: ';
const HELP_MESSAGE = 'Você pode perguntar quais são os jogos grátis deste mês... Como posso ajudar?';
const HELP_REPROMPT = 'Como posso ajudar?';
const STOP_MESSAGE = 'Tchau!';

const getFreeGames = async (link) => {
  try {
    const {
      statusCode,
      headers,
      trailers,
      body
    } = await undici.request(link);
    const freeGames = [];

    const text = await body.text()

    return await new Promise((resolve) => {

      const cells = $(
      'div.cmp-experiencefragment--your-latest-monthly-games div.box h3',
        text,
    );
      const games = cells.map((index, el) => $(el).text().replace(/&/g, 'and').replace(/®/g, '').replace(/™/g, ''));

      games.each((index) => {
        freeGames.push(games[index]);
      });

      resolve(freeGames);
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
    // current URL: https://www.playstation.com/pt-br/ps-plus/whats-new/
    const host = 'https://www.playstation.com';
    const url = `${host}/pt-br/ps-plus/whats-new/`;
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
