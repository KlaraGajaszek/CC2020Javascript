import {mainMenuNames} from '../constants'

class Question {
  constructor(typeOfQuestionIndex, howManyAnswers) {
    this._typeOfQuestion = mainMenuNames[typeOfQuestionIndex];
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
      People: 82,
      Starships: 36,
      Vehicles: 39,
    };
    return TypesOfQuestion[this._typeOfQuestion];
  }

  _createRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max) + 1);
  }

  _generateUrl(id, isImage) {
    if (!isImage) return 'https://swapi.dev/api/' + this._typeOfQuestion.toLowerCase() + '/' + id + '/';
    return '../../static/assets/img/modes/' + this._typeOfQuestion.toLowerCase() + '/' + id + '.jpg';
  }

  async _addAnswer(id) {
    try {
      return await fetch(this._generateUrl(id, false))
        .then(response => response.json()) ?? -1
    } catch(e) {
      console.log(e)
    }
  }

  async _generateAnswers() {
    let i = 0;
    while (i < this._howManyAnswers) {
      let id = this._createRandomInt(this._getMaxId());
      let answer = await this._addAnswer(id);
      if (answer !== -1 && !this._answers.includes(answer.name)) {
        this._answers.push(answer.name);
        if (i == this._rightAnswer - 1) {
          this._questionData.image = this._generateUrl(id, true);
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
  }
}

export default Question;
