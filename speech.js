var Speech = (function () {
  var speechEl = document.getElementById('speech');
  var speechAreas = [];

  var correctPhrases = [
    (body) => `Thank you for taking care of ${body.name}.`,
    (body) => `We will now start the ceremonies for ${body.name}.`,
    (body) => `${body.name}, physicist, astronaut, and in later days, bananas.`,
    (body) => `Get ${body.name} over and let's start!`,
    (body) => `Dearly departed, ${body.name}...`,
    (body) => {
      var possessive = body.gender === 'M' ? 'his' : 'her';
      var child = body.gender === 'M' ? 'daughter' : 'son';
      return `${body.name}, ${possessive} name will live on in ${possessive} ${child}, ${body.name} the 2nd.`;
    },
  ];

  var incorrectPhrases = [
    (body) => `Hey...that's not ${body.name}!`,
    (body) => `${body.name} was far more attractive.`,
    (body) => `${body.name} was far uglier.`,
    (body) => `Who is this? It's not ${body.name}!`,
    (body) => `We can't start the ceremony without ${body.name} and that's not ${body.gender === 'M' ? 'him' : 'her'}.`,
    (body) => {
      var pronoun = body.gender === 'M' ? 'He' : 'She';
      var accessory = _.sample(body.accessories);
      var string = `Are you sure that's ${body.name}?`;
      if (accessory) {
        string += ` ${pronoun} had a ${accessory}.`;
      }
      return string;
    },
  ];

  var freshnessPhrases = [
    {
      threshold: 90,
      phrase: (body) => `Wow! ${body.gender === 'M' ? 'He' : 'She'} looks fresh!`,
    },
    {
      threshold: 75,
      phrase: (body) => `${body.gender === 'M' ? 'He' : 'She'} looks pretty good.`,
    },
    {
      threshold: 60,
      phrase: (body) => `${body.gender === 'M' ? 'He' : 'She'} looks okay.`,
    },
    {
      threshold: 40,
      phrase: (body) => `Hmm... Does ${body.gender === 'M' ? 'he' : 'she'} smell a bit funny?`,
    },
    {
      threshold: 20,
      phrase: (body) => `Ugh, I think I can smell ${body.gender === 'M' ? 'him' : 'her'} from here.`,
    },
    {
      threshold: 0,
      phrase: (body) => `Did you just leave ${body.gender === 'M' ? 'him' : 'her'} to rot?!`,
    },
  ];

  function getFreshnessPhrase(body) {
    return freshnessPhrases.find(function (freshness) {
      return freshness.threshold <= body.freshness;
    });
  }

  function makeSpeechArea(position) {
    var el = document.createElement('div');
    el.classList.add('hide');
    el.style.bottom = position[1][1] - 50;
    return {
      timeout: null,
      el,
    };
  }

  function initialize(coffinPositions) {
    coffinPositions.forEach(function (position) {
      var speechArea = makeSpeechArea(position);
      speechAreas.push(speechArea);
      speechEl.appendChild(speechArea.el);
    });
  }

  function renderSpeech(phrase, i) {
    var speechArea = speechAreas[i];
    if (speechArea.timeout) return;
    speechArea.el.innerText = phrase;
    speechArea.el.classList.remove('hide');
    speechArea.timeout = setTimeout(function () { hideSpeech(i); }, 5000);
  }

  function hideSpeech(i) {
    var speechArea = speechAreas[i];
    speechArea.el.innerText = '';
    speechArea.el.classList.add('hide');
    clearTimeout(speechArea.timeout);
    speechArea.timeout = null;
  }

  function showCorrectPhrase(body, i) {
    var phrase = _.sample(correctPhrases)(body);
    var freshnessPhrase = getFreshnessPhrase(body).phrase(body);
    var fullPhrase = [phrase, freshnessPhrase].join('\n');
    hideSpeech(i);
    renderSpeech(fullPhrase, i);
  }

  function showIncorrectPhrase(body, i) {
    var phrase = _.sample(incorrectPhrases)(body);
    renderSpeech(phrase, i);
  }

  return {
    initialize,
    showCorrectPhrase,
    showIncorrectPhrase,
  };
})();
