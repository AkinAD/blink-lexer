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
      this.skipWhitespacesAndNewLines();
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
     throw new Error('Unrecognized character ${character} at line ${this.line} and column ${this.column}.');

    }
    skipWhitespacesAndNewLines() {
      while (this.position < this.input.length && CharUtils.isWhitespaceOrNewLine(this.input.charAt(this.position))) {
        this.position += 1;

        if (CharUtils.isNewLine(this.input.charAt(this.position))) {
            this.line += 1;
            this.column = 0;
        } else {
          this.column += 1;
        }

      }
    }

    /// Recognizes and returns an identifier token.
   recognizeIdentifier() {
     let identifier = '';
     let line = this.line;
     let column = this.column;
     let position = this.position;

     while (position < this.input.length) {
         let character = this.input.charAt(position);

         if (!(CharUtils.isLetter(character) || CharUtils.isDigit(character) || character === '-')) {
           break;
         }

         identifier += character;
         position += 1;
     }

     this.position += identifier.length;
     this.column += identifier.length;

     return new Token(TokenType.Identifier, identifier, line, column);
 }

   /// Recognizes and returns a number token.
   /// Recognizes and returns a number token.
 recognizeNumber() {
     let line = this.line;
     let column = this.column;

     // We delegate the building of the FSM to a helper method.
     let fsm = this.buildNumberRecognizer();

     // The input to the FSM will be all the characters from
     // the current position to the rest of the lexer's input.
     let fsmInput = this.input.substring(this.position);

     // Here, in addition of the FSM returning whether a number
     // has been recognized or not, it also returns the number
     // recognized in the 'number' variable. If no number has
     // been recognized, 'number' will be 'null'.
     let { isNumberRecognized, number } = fsm.run(fsmInput);

     if (isNumberRecognized) {
         this.position += number.length;
         this.column += number.length;

         return new Token(TokenType.Number, number, line, column);
     }

     // ...
 }

 buildNumberRecognizer() {
     // We name our states for readability.
     let State = {
         Initial: 1,
         Integer: 2,
         BeginNumberWithFractionalPart: 3,
         NumberWithFractionalPart: 4,
         BeginNumberWithExponent: 5,
         BeginNumberWithSignedExponent: 6,
         NumberWithExponent: 7,
         NoNextState: -1
     };

     let fsm = new FSM()
     fsm.states = new Set([State.Initial, State.Integer, State.BeginNumberWithFractionalPart, State.NumberWithFractionalPart, /* ... */]);
     fsm.initialState = State.Initial;
     fsm.acceptingStates = new Set([State.Integer, State.NumberWithFractionalPart, State.NumberWithExponent]);
     fsm.nextState = (currentState, character) => {
         switch (currentState) {
             case State.Initial:
                 if (CharUtils.isDigit(character)) {
                     return State.Integer;
                 }

                 break;

             case State.Integer:
                 if (CharUtils.isDigit(character)) {
                     return State.Integer;
                 }

                 if (character === '.') {
                     return State.BeginNumberWithFractionalPart;
                 }

                 if (character.toLowerCase() === 'e') {
                     return State.BeginNumberWithExponent;
                 }

                 break;

             case State.BeginNumberWithFractionalPart:
                 if (CharUtils.isDigit(character)) {
                     return State.NumberWithFractionalPart;
                 }

                 break;

             case State.NumberWithFractionalPart:
                 if (CharUtils.isDigit(character)) {
                     return State.NumberWithFractionalPart;
                 }

                 if (character.toLowerCase() === 'e') {
                     return State.BeginNumberWithExponent;
                 }

                 break;

             case State.BeginNumberWithExponent:
                 if (character === '+' || character === '-'){
                     return State.BeginNumberWithSignedExponent;
                 }

                 if (CharUtils.isDigit()) {
                     return State.NumberWithExponent;
                 }

                 break;

             case State.BeginNumberWithSignedExponent:
                 if (CharUtils.isDigit()) {
                     return State.NumberWithExponent;
                 }

                 break;

             default:
                 break;
         }

         return State.NoNextState;
     };

     return fsm;
 }

   /// Recognizes and returns an operator token.
   recognizeOperator() {
   let character = this.input.charAt(this.position);

   if (CharUtils.isComparisonOperator(character)) {
       return recognizeComparisonOperator();
   }

   if (CharUtils.isArithmeticOperator(operator)) {
       return recognizeArithmeticOperator();
   }

   // ...
}

recognizeComparisonOperator() {
   let position = this.position;
   let line = this.line;
   let column = this.column;
   let character = this.input.charAt(position);

   // 'lookahead' is the next character in the input
   // or 'null' if 'character' was the last character.
   let lookahead = position + 1 < this.input.length ? this.input.charAt(position + 1) : null;

   // Whether the 'lookahead' character is the equal symbol '='.
   let isLookaheadEqualSymbol = lookahead !== null && lookahead === '=';

   this.position += 1;
   this.column += 1;

   if (isLookaheadEqualSymbol) {
       this.position += 1;
       this.column += 1;
   }

   switch (character) {
       case '>':
           return isLookaheadEqualSymbol
               ? new Token(TokenType.GreaterThanOrEqual, '>=', line, column)
               : new Token(TokenType.GreaterThan, '>', line, column);

       case '<':
           return isLookaheadEqualSymbol
               ? new Token(TokenType.LessThanOrEqual, '<=', line, column)
               : new Token(TokenType.LessThan, '<', line, column);

       case '=':
           return isLookaheadEqualSymbol
               ? new Token(TokenType.Equal, '==', line, column)
               : new Token(TokenType.Assign, '=', line, column);

       default:
           break;
   }

   // ...
}

recognizeArithmeticOperator() {
   let position = this.position;
   let line = this.line;
   let column = this.column;
   let character = this.input.charAt(position);

   this.position += 1;
   this.column += 1;

   switch (character) {
       case '+':
           return new Token(TokenType.Plus, '+', line, column);

       case '-':
           return new Token(TokenType.Minus, '-', line, column);

       case '*':
           return new Token(TokenType.Times, '*', line, column);

       case '/':
           return new Token(TokenType.Div, '/', line, column);
   }

   // ...
}


   /// Recognizes and returns a parenthesis token.
   recognizeParenthesis() {
       /// Recognizes and returns a parenthesis token.
     let position = this.position;
     let line = this.line;
     let column = this.column;
     let character = this.input.charAt(position);

     this.position += 1;
     this.column += 1;

     if (character === '(') {
         return new Token(TokenType.LeftParenthesis, '(', line, column);
     }

     return new Token(TokenType.RightParenthesis, ')', line, column);

   }
}
