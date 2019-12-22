'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Lexer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _token = require('./token');

var _tokentype = require('./tokentype');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Lexer = exports.Lexer = function () {
    function Lexer(input) {
        _classCallCheck(this, Lexer);

        this.input = input;
        this.position = 0;
        this.line = 0;
        this.column = 0;
    }

    _createClass(Lexer, [{
        key: 'tokenize',
        value: function tokenize() {
            var tokens = [];
            var token = this.nextToken();

            while (token.type !== _tokentype.TokenType.EndOfInput) {
                tokens.push(token);
                token = this.nextToken();
            }

            return tokens;
        }
    }, {
        key: 'nextToken',
        value: function nextToken() {
            // TODO: Write your code here. :)
            if (this.position >= this.input.length) {
                return new _token.Token(_tokentype.TokenType.EndOfInput);
            }

            this.skipWhitespacesAndNewLines();

            var character = this.input.charAt(this.position);

            if (CharUtils.isLetter(character)) {
                return this.recognizeIdentifier();
            }

            if (CharUtils.isDigit(character)) {
                return this.recognizeNumber();
            }

            if (CharUtils.isOperator(character)) {
                return this.recognizeOperator();
            }

            if (CharUtils.isParenthesis(character)) {
                return this.recognizeParenthesis();
            }

            // Throw an error if the current character does not match
            // any production rule of the lexical grammar.
            throw new Error('Unrecognized character ${character} at line ${this.line} and column ${this.column}.');
        }
    }, {
        key: 'skipWhitespacesAndNewLines',
        value: function skipWhitespacesAndNewLines() {
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

    }, {
        key: 'recognizeIdentifier',
        value: function recognizeIdentifier() {
            var identifier = '';
            var line = this.line;
            var column = this.column;
            var position = this.position;

            while (position < this.input.length) {
                var character = this.input.charAt(position);

                if (!(CharUtils.isLetter(character) || CharUtils.isDigit(character) || character === '-')) {
                    break;
                }

                identifier += character;
                position += 1;
            }

            this.position += identifier.length;
            this.column += identifier.length;

            return new _token.Token(_tokentype.TokenType.Identifier, identifier, line, column);
        }

        /// Recognizes and returns a number token.
        /// Recognizes and returns a number token.

    }, {
        key: 'recognizeNumber',
        value: function recognizeNumber() {
            var line = this.line;
            var column = this.column;

            // We delegate the building of the FSM to a helper method.
            var fsm = this.buildNumberRecognizer();

            // The input to the FSM will be all the characters from
            // the current position to the rest of the lexer's input.
            var fsmInput = this.input.substring(this.position);

            // Here, in addition of the FSM returning whether a number
            // has been recognized or not, it also returns the number
            // recognized in the 'number' variable. If no number has
            // been recognized, 'number' will be 'null'.

            var _fsm$run = fsm.run(fsmInput),
                isNumberRecognized = _fsm$run.isNumberRecognized,
                number = _fsm$run.number;

            if (isNumberRecognized) {
                this.position += number.length;
                this.column += number.length;

                return new _token.Token(_tokentype.TokenType.Number, number, line, column);
            }

            // ...
        }
    }, {
        key: 'buildNumberRecognizer',
        value: function buildNumberRecognizer() {
            // We name our states for readability.
            var State = {
                Initial: 1,
                Integer: 2,
                BeginNumberWithFractionalPart: 3,
                NumberWithFractionalPart: 4,
                BeginNumberWithExponent: 5,
                BeginNumberWithSignedExponent: 6,
                NumberWithExponent: 7,
                NoNextState: -1
            };

            var fsm = new FSM();
            fsm.states = new Set([State.Initial, State.Integer, State.BeginNumberWithFractionalPart, State.NumberWithFractionalPart]);
            fsm.initialState = State.Initial;
            fsm.acceptingStates = new Set([State.Integer, State.NumberWithFractionalPart, State.NumberWithExponent]);
            fsm.nextState = function (currentState, character) {
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
                        if (character === '+' || character === '-') {
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

    }, {
        key: 'recognizeOperator',
        value: function recognizeOperator() {
            var character = this.input.charAt(this.position);

            if (CharUtils.isComparisonOperator(character)) {
                return recognizeComparisonOperator();
            }

            if (CharUtils.isArithmeticOperator(operator)) {
                return recognizeArithmeticOperator();
            }

            // ...
        }
    }, {
        key: 'recognizeComparisonOperator',
        value: function recognizeComparisonOperator() {
            var position = this.position;
            var line = this.line;
            var column = this.column;
            var character = this.input.charAt(position);

            // 'lookahead' is the next character in the input
            // or 'null' if 'character' was the last character.
            var lookahead = position + 1 < this.input.length ? this.input.charAt(position + 1) : null;

            // Whether the 'lookahead' character is the equal symbol '='.
            var isLookaheadEqualSymbol = lookahead !== null && lookahead === '=';

            this.position += 1;
            this.column += 1;

            if (isLookaheadEqualSymbol) {
                this.position += 1;
                this.column += 1;
            }

            switch (character) {
                case '>':
                    return isLookaheadEqualSymbol ? new _token.Token(_tokentype.TokenType.GreaterThanOrEqual, '>=', line, column) : new _token.Token(_tokentype.TokenType.GreaterThan, '>', line, column);

                case '<':
                    return isLookaheadEqualSymbol ? new _token.Token(_tokentype.TokenType.LessThanOrEqual, '<=', line, column) : new _token.Token(_tokentype.TokenType.LessThan, '<', line, column);

                case '=':
                    return isLookaheadEqualSymbol ? new _token.Token(_tokentype.TokenType.Equal, '==', line, column) : new _token.Token(_tokentype.TokenType.Assign, '=', line, column);

                default:
                    break;
            }

            // ...
        }
    }, {
        key: 'recognizeArithmeticOperator',
        value: function recognizeArithmeticOperator() {
            var position = this.position;
            var line = this.line;
            var column = this.column;
            var character = this.input.charAt(position);

            this.position += 1;
            this.column += 1;

            switch (character) {
                case '+':
                    return new _token.Token(_tokentype.TokenType.Plus, '+', line, column);

                case '-':
                    return new _token.Token(_tokentype.TokenType.Minus, '-', line, column);

                case '*':
                    return new _token.Token(_tokentype.TokenType.Times, '*', line, column);

                case '/':
                    return new _token.Token(_tokentype.TokenType.Div, '/', line, column);
            }

            // ...
        }

        /// Recognizes and returns a parenthesis token.

    }, {
        key: 'recognizeParenthesis',
        value: function recognizeParenthesis() {
            /// Recognizes and returns a parenthesis token.
            var position = this.position;
            var line = this.line;
            var column = this.column;
            var character = this.input.charAt(position);

            this.position += 1;
            this.column += 1;

            if (character === '(') {
                return new _token.Token(_tokentype.TokenType.LeftParenthesis, '(', line, column);
            }

            return new _token.Token(_tokentype.TokenType.RightParenthesis, ')', line, column);
        }
    }]);

    return Lexer;
}();
//# sourceMappingURL=lexer.js.map