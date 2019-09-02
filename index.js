/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const request = require('request-promise');
const $ = require('cheerio');

const getFreeGamesLink = async () => {
  try {
    const host = "https://store.playstation.com";
    const url = `${host}/pt-br/home/games/psplus`;

    const response = await request(url);

    return await new Promise((resolve, reject) => {
      const link = $('a:contains("Jogos Gratuitos")', response).attr('href');
      if(!link) {
        return reject(link);
      }
      resolve(`${host}${link}`);
    });
  } catch (error) {
    throw error;
  }
}

const getFreeGames = async (link) => {
  try {
    const response = await request(link);
    let freeGames = [];

    return await new Promise((resolve, reject) => {
      const cells = $('.grid-cell__title > span', response);
      const games = cells.map(function (index, el) {
        return $(el).text();
      });
      freeGames.push(games[0]);
      freeGames.push(games[1]);

      resolve(freeGames);
    });
  } catch(error) {
    throw error;
  }
}

const FreeGamesHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'FreeGamesIntent');
  },
  async handle(handlerInput) {
    const link = await getFreeGamesLink();
    const freeGames = await getFreeGames(link);

    const freeGamesSpeech = `<lang xml:lang='en-US'>${freeGames[0]}</lang> e <lang xml:lang='en-US'>${freeGames[1]}</lang>`;
    const speechOutput = FREE_GAMES_MESSAGE + freeGamesSpeech;

    return handlerInput.responseBuilder
      .speak(speechOutput)
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

const FREE_GAMES_MESSAGE = 'Aqui estão os jogos grátis deste mês: ';
const HELP_MESSAGE = 'Você pode perguntar quais são os jogos grátis deste mês... Como posso ajudar?';
const HELP_REPROMPT = 'Como posso ajudar?';
const STOP_MESSAGE = 'Tchau!';

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
