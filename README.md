# Jogos Grátis da Plus

Lambda function para fazer scraping da PS Store e pegar quais são os jogos grátis da PS Plus deste mês, e retornar um XML para uso por uma skill da Alexa.

## Demo

> "Alexa, pergunte a jogos da plus quais são os jogos do mês"


### Testando a function localmente

Instale o [SAM CLI](https://github.com/aws/aws-sam-cli) e rode

```
sam local invoke "FreeGames" -e event.json
```

### Atualizando a Lambda function

```
$ zip -r function.zip . -x "*.git*"
$ aws lambda update-function-code --function-name [function name] --zip-file fileb://function.zip
```
