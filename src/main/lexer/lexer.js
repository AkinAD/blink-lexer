import { CharUtils } from '../util/charutils'
import { InvalidFsmState, Fsm } from './fsm'
import { Report } from '../util/report'
import { Token } from './token'
import { TokenType } from './tokentype'

export class Lexer {
    constructor(input) {
        this.input = input;
        this.inputSize = input.length;
        this.position = 0;
        this.line = 0;
        this.column = 0;
        this.buffer = [];
    }

    tokenize() {
        let tokens = [];
        let token = this.nextToken();

        while (token.type !== TokenType.EndOfInput) {
            tokens.push(token);
            token = this.nextToken();
        }

        return tokens;
    }

    nextToken() {
        // TODO: Write your code here. :)
      }

    lookahead() {
       var token = this.readToken();
       this.buffer.push(token);
       return token;

    }

    readToken() {
      this.skipWhitespaces();
      let character = this.input.charAt(this.position);

      if (this.position >= this.inputSize)
      {
        return new Token(TokenType.EndOfInput);
      }

      if (CharUtils.isBeginningOfLiteral(character)) {
         return this.recognizeLiteral();
      }

      if (CharUtils.isOperator(character)){
        return this.recognizeOperator();
      }

      if (CharUtils.isDelimiter(character)) {
        return this.recognizeDelimiter();
      }

      if (CharUtils.isDot(character)){
        let column = this.column;

        this.position++;
        this.column++;

        return new Token(TokenType.Dot, '.', this.line, column);
      }

      if (CharUtils.isNewLine(character)){
         let column = this.column;
         let line = this.line;

         this.position++;
         this.column++;
         this.column = 0;

         return new Token(TokenType.Newline, '\n', line, column);
      }

      if (CharUtils.isLetter(character)){
        return this.recognizeIdentifier();
      }

      if (CharUtils.isDigit(character)){
        return this.recognizeNumber();
      }

      if (CharUtils.isParenthesis(character)) {
         return this.recognizeParenthesis();
     }

     // Throw an error if the current character does not match
     // any production rule of the lexical grammar.
     // throw new Error('Unrecognized character ${character} at line ${this.line} and column ${this.column}.');
     throw new Error(Report.error(this.line, this.column, `Unrecognized token '${symbol}'.`));

    }
    skipWhitespacesAndNewLines() {
      while (this.position < this.inputSize && CharUtils.isWhitespaceOrNewLine(this.input.charAt(this.position))) {
        this.position += 1;

        if (CharUtils.isNewLine(this.input.charAt(this.position))) {
            this.line += 1;
            this.column = 0;
        } else {
          this.column += 1;
        }

      }
    }

    recognizeLiteral() {
      let character = this.input.charAt(this.position);

      if (CharUtils.isLetter(character)){
          return this.recognizeKeywordOrIdentifier();
      }

      if (CharUtils.isBeginningOfIdentifier(character)){
          return this.recognizeIdentifier();
      }

      if (CharUtils.isBeginningOfNumber(character)){
          return this.recognizeNumber();
      }

      if (CharUtils.isBeginningOfString(character)){
          return this.recognizeString();
      }

      throw new Error(Report.error(this.line, this.column, `Unrecognized token '${symbol}'.`));
    }

    //Recognizes AND RETURNS KEYQORD OR IDENTIFIER tokens
    recognizeKeywordOrIdentifier(){
      let token =  this.recognizeKeyword();
      return token !== null ? token : this.recognizeIdentifier();  // return keyword token  if its a keyword and if it is not ( null) then return identifier token

    }

    recognizeKeyword(){
      let character = this.input.charAt(this.position);

      let keywords =  Object.keys(TokenType).filter(key => TokenType[key].charAt(0) === character)

      for(let i in keywords) {
         let keyword = keywords[i];

         let token = this.recognizeToken(TokenType[keyword]);

         if (token !== null) {
            let offset = token.value.length;

            if(CharUtils.isIdentifierPart(this.input.charAt(this.position + offset))){
              return null;
            }

            this.potition += offset;
            this.column += offset;
         }
      }
      return null;
    }
    /// Recognizes and returns an identifier token.
   recognizeIdentifier() {
     let identifier = '';
     let column = this.column;

     while (position < this.input.length) {
         let character = this.input.charAt(position);

         if (!(CharUtils.isIdentifierPart(character)) {
           break;
         }

         identifier += character;
         position += 1;
     }
     this.column += identifier.length;

     return new Token(TokenType.Identifier, identifier, line, column);
 }

   /// Recognizes and returns a number token.
   /// Recognizes and returns a number token.
 recognizeNumber() {
     // We delegate the building of the FSM to a helper method.
     let recognizer = this.buildNumberRecognizer();
     let { recognized, value } = recognizer.run(this.input.substring(this.position));

     if(!recognized){
       throw new Error(Report.error(this.line, this.column, 'Unrecognized number literal.'));
     }

     if(this.input.charAt(this.position) === '.' && value === '.') {
       this.position++;
       this.column++;

       return new Token(TokenType.Dot, '.', this.line, this.column - 1)
     }
     let offset = value.length;

     if(value.charAt(offset - 1) === '.'){
        value = value.substring(0, offset - 1);
        offset--;
     }
     let column = this.column;

     this.position +=  offset;
     this.column += offset;

     return new Token(value.includes('.') || value.includes('e') || value.includes('E') ? TokenType.Decimal : TokenType.Integer, value, this.line, column);
 }

recognizeString() {
 let recognizer = this.buildStringRecognizer();
 let { recognized, value } = recognizer.run(this.input.substring(this.position));

 if (!recognized)
 {
   throw new Error(Report.error(this.line, this.column, 'Invalid string literal.'));
 }
 let offset = value.length;
 let column = this.column;

 this.position += offset;
 this.column += offset;

 return new Token(TokenType.String, value, this.line, column);
}

recognizeToken(token) {
  let length = token.length;

  for(let i = 0;; i < length; ++i){
    if (this.input.charAt(this.position + i) !== token.charAt(i)){
      return null;
    }
  }
  return new Token(token, token, this.line, this.column);

}

recognizeDelimiter() {
  let character = this.input.charAt(this.position);
  let column = this.column;

  this.position++;
  this.column++;
  switch (symbol) {
            case '{':
                return new Token(TokenType.LeftBrace, '{', this.line, column);

            case '}':
                return new Token(TokenType.RightBrace, '}', this.line, column);

            case '[':
                return new Token(TokenType.LeftBracket, '[', this.line, column);

            case ']':
                return new Token(TokenType.RightBracket, ']', this.line, column);

            case '(':
                return new Token(TokenType.LeftParen, '(', this.line, column);

            case ')':
                return new Token(TokenType.RightParen, ')', this.line, column);

            case ',':
                return new Token(TokenType.Comma, ',', this.line, column);

            case ':':
                return new Token(TokenType.Colon, ':', this.line, column);

            default:
                throw new Error(Report.error(this.line, this.column, `Unrecognized token '${symbol}'.`));
        }
}

   /// Recognizes and returns an operator token.
   recognizeOperator() {
   let character = this.input.charAt(this.position);
   // 'lookahead' is the next character in the input
   // or 'null' if 'character' was the last character.
   let lookahead = position + 1 < this.input.length ? this.input.charAt(position + 1) : null;
   let column = this.column;

   if (lookahead !== null && (lookahead === '=' || lookahead === '&' || lookahead === '|' || lookahead === '-')) {
     this.position++;
     this.column++;
   }
   this.position++;
   this.column++;
   let isLookaheadEqualSymbol = lookahead !== null && lookahead === '=';
   switch (symbol) {
        case '=':
            return isLookaheadEqualSymbol
                ? new Token(TokenType.DoubleEqual, '==', this.line, column)
                : new Token(TokenType.Equal, '=', this.line, column);
        case '%':
            return isLookaheadEqualSymbol
                  ? new Token(TokenType.ModuloEqual, '%=', this.line, column)
                  : new Token(TokenType.Modulo, '%', this.line, column);
        case '*':
            return isLookaheadEqualSymbol
                  ? new Token(TokenType.TimesEqual, '*=', this.line, column)
                  : new Token(TokenType.Times, '*', this.line, column);
        case '+':
            return isLookaheadEqualSymbol
                  ? new Token(TokenType.PlusEqual, '+=', this.line, column)
                  : new Token(TokenType.Plus, '+', this.line, column);
        case '!':
            return isLookaheadEqualSymbol
                  ? new Token(TokenType.NotEqual, '!=', this.line, column)
                  : new Token(TokenType.Not, '!', this.line, column);
        case '~':
            return isLookaheadEqualSymbol
                  ? new Token(TokenType.TildeEqual, '~=', this.line, column)
                  : new Token(TokenType.Tilde, '~', this.line, column);
        case '$':
            return isLookaheadEqualSymbol
                  ? new Token(TokenType.DollarEqual, '$=', this.line, column)
                  : new Token(TokenType.Dollar, '$', this.line, column);
        case '^':
            return isLookaheadEqualSymbol
                  ? new Token(TokenType.CaretEqual, '~=', this.line, column)
                  : new Token(TokenType.Caret, '~', this.line, column);
        case '&':
            if (lookahead !== null && lookahead === '&') {
                    return new Token(TokenType.And, '&&', this.line, column);
                }
          case '|':
            if (lookahead !== null && lookahead === '|') {
                    return new Token(TokenType.And, '||', this.line, column);
                }
          case '/':
            if (lookahead !== '=' && lookahead !== '/') {
                    return new Token(TokenType.Div, '/', this.line, column);
                }
            if (lookahead === '='){
                    return new Token(TokenType.DivEqual, '/=', this.line, column);
                }
            if (lookahead === '/'){
                  this.skipUntilNewline();

                  return this.nextToken();
                }
                break;
        case '>':
              return lookahead !== null && lookahead === '='
                  ? new Token(TokenType.GreaterOrEqual, '>=', this.line, column)
                  : new Token(TokenType.Greater, '>', this.line, column);
        case '<':
            if (lookahead !== '=' && lookahead !== '-') {
              return new Token(TokenType.Less, '<', this.line, column);
            }

            if (lookahead === '=') {
                return new Token(TokenType.LessOrEqual, '<=', this.line, column);
            }

            if (lookahead === '-') {
                return new Token(TokenType.LeftArrow, '<-', this.line, column);
            }

            break;

        case '-' :
            if(lookahead == null || (lookahead !== '=' && lookahead !== '>'))
            {
                return new Token(TokenType.Minus, '-', this.line, column);
            }
            if (lookahead === '=')
            {
                return new Token(TokenType.MinusEqual, '-=', this.line, column);
            }
            if (lookahead === '>')
            {
              return new Token(TokenType.RightArrow, '->', this.line, column)
            }
            throw new Error(Report.error(this.line, this.column, `Unrecognized token '${symbol}'.`));

        default:
            throw new Error(Report.error(this.line, this.column, `Unrecognized token '${symbol}'.`));
    }
}
buildStringRecognizer(){
  let recognizer =  new Fsm();
  recognizer.states =  new Set(['Start', 'StartString', 'Character', 'Backslash', 'EscapeSequence', 'EndString']);

  recognizer.startState = 'Start';
  recognizer.finalStaes = new Set(['EndString']);

  recognizer.transition = (state, symbol )=> {
    switch(state){
      case 'Start':
        if (CharUtils.isStringDelimiter(symbol)) {
          return 'StartString'
        }
        break;
      case 'StartString':
      case 'Character':
        if (CharUtils.isStringDelimiter(symbol)) {
          return 'EndString';
        }

        if (CharUtils.isEscapeCharacter(symbol)) {
          return 'Backslash';
        }

        return 'Character';
      case 'Backslash':
        if(CharUtils.isEndofEscapeCharacter(symbol)){
          return 'EscapeSequence';
        }
        break;
      case 'EscapeSequence':
        if(CharUtils.isStirngDelimiter(symbol))
        {
          return 'EndString';
        }
        if (CharUtils.isEscapeCharacter(symbol))
        {
          return 'Backslash';
        }
        return 'character'
      default:
        break;
    }
    return InvalidFsmState;
  };
  return recognizer;
}

buildNumberRecognizer() {
        let recognizer = new Fsm();

        recognizer.states = new Set(['Start', 'Zero', 'Integer', 'StartDecimal', 'Decimal', 'StartExponentNotation', 'NumberInExponentNotation', 'End']);

        recognizer.startState = 'Start';

        recognizer.finalStates = new Set(['Zero', 'Integer', 'StartDecimal', 'Decimal', 'NumberInExponentNotation', 'End']);

        recognizer.transition = (state, symbol) => {
            switch (state) {
                case 'Start':
                    if (symbol === '0') {
                        return 'Zero';
                    }

                    if (symbol === '.') {
                        return 'StartDecimal';
                    }

                    if (CharUtils.isDigit(symbol)) {
                        return 'Integer';
                    }

                    break;

                case 'Zero':
                    if (CharUtils.isExponentSymbol(symbol)) {
                        return 'StartExponentNotation';
                    }

                    if (symbol == '.') {
                        return 'StartDecimal';
                    }

                    break;

                case 'Integer':
                    if (CharUtils.isDigit(symbol)) {
                        return 'Integer';
                    }

                    if (CharUtils.isExponentSymbol(symbol)) {
                        return 'StartExponentNotation';
                    }

                    if (symbol == '.') {
                        return 'StartDecimal';
                    }

                    break;

                case 'StartDecimal':
                    if (CharUtils.isDigit(symbol)) {
                        return 'Decimal';
                    }

                    return InvalidFsmState;

                case 'StartExponentNotation':
                    if (CharUtils.isDigit(symbol) || symbol === '-') {
                        return 'NumberInExponentNotation';
                    }

                    break;

                case 'Decimal':
                    if (CharUtils.isDigit(symbol)) {
                        return 'Decimal';
                    }

                    if (CharUtils.isExponentSymbol(symbol)) {
                        return 'StartExponentNotation';
                    }

                    break;

                case 'NumberInExponentNotation':
                    if (CharUtils.isDigit(symbol)) {
                        return 'NumberInExponentNotation';
                    }

                    break;

                default:
                    break;
            }

            return InvalidFsmState;
        };

        return recognizer;
    }
    
   skipWhitespaces() {
        while (this.position < this.inputSize && CharUtils.isWhitespace(this.input.charAt(this.position))) {
            this.position++;
            this.column++;
        }
    }

    skipUntilNewline() {
        while (this.position < this.inputSize && !CharUtils.isNewline(this.input.charAt(this.position))) {
            this.position++;
            this.column++;
        }
    }
}
