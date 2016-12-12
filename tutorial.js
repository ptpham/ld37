var Tutorial = (function () {
  var tutorialEl = document.getElementById('tutorial');

  var introText = [
    `Welcome to Budget Mortuary!`,

    `Your job is to move corpses to the freezer, ` +
    `where they will be stored until they are called for during the funeral services.`,

    `To move corpses, drag them around with your cursor.`,

    `Oh, since you're the only employee, you'll also need to bring `+
    `the right corpse to the right funeral service as well.`,

    `Corpses outside the freezer will spoil over time, so make sure to ` +
    `get them in there as soon as possible!`,

    `Unfortunately, at this time, we're only able to afford a single freezer room. ` +
    `Hopefully, you'll find a way to pack them all in!`,
  ];

  function initialize(callback) {
    var buttonEl = document.createElement('button');
    buttonEl.innerText = 'Ready!';

    introText.forEach(function (html) {
      var el = document.createElement('p');
      el.innerHTML = html;
      tutorialEl.appendChild(el);
    });

    tutorialEl.appendChild(buttonEl);

    buttonEl.addEventListener('click', function () {
      tutorialEl.parentElement.removeChild(tutorialEl);
      callback();
    });
  }

  return { initialize };
})();
