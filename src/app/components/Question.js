const fetch = require('node-fetch');
const fs = require('fs');

class Question {
  constructor(typeOfQuestion, howManyAnswers) {
    this._typeOfQuestion = typeOfQuestion;
    this._howManyAnswers = howManyAnswers;
    this._rightAnswer = this._createRandomInt(this._howManyAnswers);
    this._answers = [];
    this._questionData = {};
  }

  get questionData() {
    return this._questionData;
  }

  _getMaxId() {
    const TypesOfQuestion = {
      people: 82,
      starships: 36,
      vehicles: 39,
    };
    return TypesOfQuestion[this._typeOfQuestion];
  }

  _createRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max) + 1);
  }

  _generateUrl(id, isImage) {
    if (!isImage) {
      const baseUrl = 'https://swapi.dev/api/';
      return baseUrl + this._typeOfQuestion + '/' + id + '/';
    } else {
      const url =
        'static/assets/img/modes/' + this._typeOfQuestion + '/' + id + '.jpg';
      return url;
    }
  }

  async _addAnswer(id) {
    const response = await fetch(this._generateUrl(id, false));
    return response.ok ? await response.json() : -1;
  }

  _base64_encode(fileURL) {
    return (
      'data:image/jpg;base64,' +
      fs.readFileSync(fileURL, { encoding: 'base64' })
    );
  }

  async _generateAnswers() {
    let i = 0;
    while (i < this._howManyAnswers) {
      let id = this._createRandomInt(this._getMaxId(this._typeOfQuestion));
      let answer = await this._addAnswer(id);
      if (answer !== -1 && !this._answers.includes(answer.name)) {
        this._answers.push(answer.name);
        if (i == this._rightAnswer - 1) {
          this._questionData.image = this._base64_encode(
            this._generateUrl(id, true),
          );
        }
        i++;
      }
    }
  }

  async getQuestionData() {
    await this._generateAnswers()
      .then(() => {
        this._questionData.answers = this._answers;
        this._questionData.rightAnswer = this._rightAnswer;
      })
      .catch((error) => console.log(error));

    // return this._questionData;
  }
}

const question = new Question('people', 4);
question.getQuestionData().then(() => console.log(question.questionData));
