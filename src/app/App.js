import Box from './components/Box';
import MainMenu from './components/MainMenu';
import Button from './components/Button';
import Picture from './components/Picture';
import { RankingBox } from './components/RankingBox';
import WhiteButton from './components/WhiteButton';
import Modal from './components/Modal';
import Timer from './components/Timer';
import Lightsaber from './components/lightsaber';
import Rules from './components/Rules';
import QuestionAnswers from './components/QuestionAnswers';
import GameOverScreen from './components/ModalContent';
import Logo from './components/Logo';
import Question from './components/Question';
import ComputerPlayer from './ComputerPlayer/';
import {
  initialGMIndex,
  whiteBtnText,
  playBtnText,
  mainMenuNames,
} from './constants';
import { getScoreLocalStorage } from './LocalStorage';

class App {
  constructor(options, time, numberOfAnswers, totalQuestions) {
    this.time = time;
    this.numberOfAnswers = numberOfAnswers;
    this.totalQuestions = totalQuestions;
    this.renderMainVievComponents()
  }

  renderMainVievComponents() {
    this.logo = new Logo('logo');
    this.box = new Box('box');
    this.modal = new Modal('modalBox');
    this.button = new Button('button', playBtnText, 'play-button');
    this.rules = new Rules('Mode Rules', 'rules');
    this.picture = new Picture('picture');
    this.mainMenuPanel = new MainMenu(
      'mainMenu',
      mainMenuNames,
      initialGMIndex,
      this.rankingBox
    );

    this.scores = getScoreLocalStorage(this.mainMenuPanel.gameModeIndex);
    this.rankingBox = new RankingBox('ranking-box', this.scores);

    this.whiteButton = new WhiteButton(
      'whiteButton',
      whiteBtnText[0],
      'whiteButton',
    );

    this.computerPlayer = new ComputerPlayer();

    this.setMainVievLogic();
  }

  setMainVievLogic() {
    this.whiteBtn = document.querySelector('.whiteButton');
    this.btns = document.querySelectorAll('.mainMenu > div > button');
    this.playBtn = document.querySelector('.play-button');

    this.mainMenuPanel.addClasses(this.mainMenuPanel.gameModeIndex, this.btns);

    this.btns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.mainMenuPanel.btnIndex(index, this.btns);
        this.rules.handleRulesContent(index);
        this.box.handleBoxContent(index, false);
        this.picture.handleExemplaryPicture(index);
      });
    });

    this.whiteBtn.addEventListener('click', () => {
      this.rulesContent();
    });

    this.playBtn.addEventListener('click', () => {
      this.renderGame();
    });

    window.addEventListener('click', (e) => this.closeModalOutside(e))
  }

  closeModalOutside(e) {
    e.target === modal ? this.closeWindow() : null;
  }

  closeWindow() {
    location.reload(true);
  };

  setScoresInRankingBox() {
    this.scores = getScoreLocalStorage(this.mainMenuPanel.gameModeIndex);
    this.rankingBox = new RankingBox('ranking-box', this.scores);
  }

  rulesContent() {
    this.setScoresInRankingBox();
    const whiteBtnContent = document.querySelector('.whiteButton span');
    const whiteBtnIcon = document.querySelector('.whiteButton img');
    const rulesElement = document.querySelector('#rules');
    const rankingElement = document.querySelector('#ranking-box');

    if (whiteBtnContent.textContent === whiteBtnText[0]) {
      whiteBtnContent.textContent = whiteBtnText[1];
      whiteBtnIcon.setAttribute('src', '../../static/assets/ui/school.svg');
      rulesElement.style.display = 'none';
      rankingElement.style.display = 'flex';
    } else {
      whiteBtnContent.textContent = whiteBtnText[0];
      whiteBtnIcon.setAttribute('src', '../../static/assets/ui/hof.svg');
      rankingElement.style.display = 'none';
      rulesElement.style.display = 'flex';
    }
  }

  async generateQuestion() {
    const question = new Question(
      this.mainMenuPanel.gameModeIndex,
      this.numberOfAnswers,
    );
    const quizPicture = document.getElementsByClassName('quiz__picture')[0];
    const answerBtnsCN = document.getElementById('answers').childNodes;

    await question.getQuestionData().then(() => {
      if (!this.questionAnswers) {
        this.questionAnswers = new QuestionAnswers(
          '#answers',
          question._answers,
          question._rightAnswer,
        );
      }
      this.questionAnswers.answers = question._answers;
      this.questionAnswers.picture = atob(question.questionData.image);
      this.questionAnswers.correctAnswer = this.questionAnswers.answers[
        question._rightAnswer - 1
      ];
      for (let i = 0; i < question._answers.length; i++) {
        answerBtnsCN[i].textContent = question._answers[i];
      }

      quizPicture.setAttribute('src', atob(question.questionData.image));
    });
  }

  async renderGame() {
    this.score = 0;
    this.questionsAnswerred = 0;

    this.timer = new Timer(this.time, 'timer-box');
    this.lightsaber = new Lightsaber(this.time, 'saber');

    const whiteButton = document.getElementById('whiteButton');
    const rules = document.getElementById('rules');
    const rankingBox = document.getElementById('ranking-box');
    const playButton = document.getElementById('button');
    const modalBox = document.getElementById('modal');
    const gameModeBtns = document.querySelectorAll('.mainMenu > div > button');
    const timerBox = document.getElementById('timer-box');
    const closeModalBox = modalBox.querySelector('.close');

    closeModalBox.addEventListener('click', this.closeWindow);

    gameModeBtns.forEach((button) => {
      button.style.cursor = 'default';
      let newEl = button.cloneNode(true);
      button.parentNode.replaceChild(newEl, button);
    });

    const saber = document.getElementById('saber');
    if (window.innerHeight > window.innerWidth) saber.style.gridArea = 'play';

    window.addEventListener('resize', () => {
      window.innerHeight > window.innerWidth
        ? (saber.style.gridArea = 'play')
        : (saber.style.gridArea = 'lightsaber');
    });

    whiteButton.style.display = 'none';
    rules.style.display = 'none';
    rankingBox.style.display = 'none';
    playButton.style.display = 'none';

    this.box.handleBoxContent(this.mainMenuPanel.gameModeIndex, true);

    this.gamePlaySummary = [];

    await this.generateQuestion().then(() => {
      const answerBtns = document.querySelectorAll('#answers > button')
      let gameOn = true;
      this.gamePlaySummary.length = 0;

      // to refactor
      answerBtns.forEach((btn) =>
        btn.addEventListener('click', () => {

          if (gameOn && this.questionsAnswerred < this.totalQuestions) {
            const roundSummary = {
              playerAnswer: btn.textContent,
              correctAnswer: this.questionAnswers.correctAnswer,
              questionPicture: this.questionAnswers.picture,
              computerAnswer: this.computerPlayer.askQuestion(this.questionAnswers.answers),
            }
            roundSummary.computerAnswerIsCorrect = roundSummary.correctAnswer === roundSummary.computerAnswer;
            gameOn = false;
            if (btn.textContent === this.questionAnswers.correctAnswer) {
              this.score++;
              btn.classList.add('correct-answer');
              roundSummary.playerAnswerIsCorrect = true;
            } else {
              btn.classList.add('wrong-answer');
              roundSummary.playerAnswerIsCorrect = false;
            }
            this.questionsAnswerred++;
            this.gamePlaySummary.push(roundSummary);
            setTimeout(() => {
              for (let i = 0; i < answerBtns.length; i++) {
                if (answerBtns[i].textContent === this.questionAnswers.correctAnswer) {
                  answerBtns[i].classList.add('correct-answer');
                }
              }
            }, 300);

            setTimeout(() => {
              answerBtns.forEach((btn) => {
                btn.classList.remove('correct-answer');
                btn.classList.remove('wrong-answer');
              });
              this.generateQuestion().then(() => {
                gameOn = true;
              });
            }, 1000);
          }
        }),
      );
    });

    const interval = setInterval(() => {
      this.timer.decrement();
      this.lightsaber.progress(this.time);
    }, 1000);

    setTimeout(() => {
      this.gameOverScreen = new GameOverScreen(this.gamePlaySummary, 'modalBox', this.mainMenuPanel.gameModeIndex, this.closeWindow)
      modalBox.style.display = 'block';
      timerBox.style.display = 'none';
      clearInterval(interval)
    }, this.timer.time * 1000);
  }

  isAnswerCorrect(correctAnswer, playerAnswer) {
    return correctAnswer === playerAnswer;
  }
}

export default App;
