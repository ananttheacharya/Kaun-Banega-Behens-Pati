/**
 * KAUN BANEGA CROREPATI - HOST CONTROLLER & QUESTION EDITOR
 * Gives the event host complete live control over the game,
 * including overrides, question editing, audio toggles, and scoreboard adjustments.
 */

class KBCHostController {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.isOpen = false;
    this.initDOM();
  }

  initDOM() {
    this.triggerBtn = document.getElementById('hostFloatingTrigger');
    this.drawer = document.getElementById('hostDrawer');
    this.closeBtn = document.getElementById('hostDrawerClose');

    // Host Action Buttons
    this.btnHostLock = document.getElementById('btnHostLock');
    this.btnHostReveal = document.getElementById('btnHostReveal');
    this.btnHostCorrect = document.getElementById('btnHostCorrect');
    this.btnHostWrong = document.getElementById('btnHostWrong');
    this.btnHostTimer = document.getElementById('btnHostTimer');
    this.btnHostAddTimer = document.getElementById('btnHostAddTimer');
    this.btnHostResetLifelines = document.getElementById('btnHostResetLifelines');
    this.btnHostSkipQ = document.getElementById('btnHostSkipQ');
    this.btnHostFinale = document.getElementById('btnHostFinale');
    this.btnHostQuestionEditor = document.getElementById('btnHostQuestionEditor');
    this.btnHostSoundIntro = document.getElementById('btnHostSoundIntro');
    this.btnHostSoundQuestion = document.getElementById('btnHostSoundQuestion');
    this.btnHostMute = document.getElementById('btnHostMute');

    // Editor Modal
    this.editorModal = document.getElementById('questionEditorModal');

    this.bindEvents();
  }

  bindEvents() {
    this.triggerBtn.addEventListener('click', () => this.toggleDrawer());
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.toggleDrawer(false));
    }

    // Host Actions
    this.btnHostLock.addEventListener('click', () => {
      this.game.lockCurrentSelection();
    });

    this.btnHostReveal.addEventListener('click', () => {
      this.game.revealAnswer();
    });

    this.btnHostCorrect.addEventListener('click', () => {
      // Force correct
      const correctIdx = this.game.currentQuestion.formattedOptions.findIndex(o => o.isCorrect);
      this.game.selectedOptionIndex = correctIdx;
      this.game.revealAnswer();
    });

    this.btnHostWrong.addEventListener('click', () => {
      // Force wrong
      const wrongIdx = this.game.currentQuestion.formattedOptions.findIndex(o => !o.isCorrect);
      this.game.selectedOptionIndex = wrongIdx;
      this.game.revealAnswer();
    });

    this.btnHostTimer.addEventListener('click', () => {
      if (this.game.isTimerPaused) {
        this.game.resumeTimer();
        this.btnHostTimer.textContent = "⏸️ Pause Timer";
      } else {
        this.game.pauseTimer();
        this.btnHostTimer.textContent = "▶️ Resume Timer";
      }
    });

    this.btnHostAddTimer.addEventListener('click', () => {
      this.game.timerSeconds += 15;
      this.game.updateTimerDisplay();
    });

    this.btnHostResetLifelines.addEventListener('click', () => {
      this.game.lifelines = {
        fiftyFifty: true,
        phoneFriend: true,
        audiencePoll: true,
        askExpert: true
      };
      this.game.updateLifelineUI();
      // Also restore eliminated options if any
      this.game.optionBtns.forEach(b => b.classList.remove('eliminated'));
    });

    this.btnHostSkipQ.addEventListener('click', () => {
      if (this.game.currentLevel < 15) {
        this.game.currentLevel++;
        this.game.loadQuestionForCurrentLevel();
      }
    });

    this.btnHostFinale.addEventListener('click', () => {
      this.game.showGrandFinaleModal();
    });

    this.btnHostQuestionEditor.addEventListener('click', () => {
      this.openQuestionEditor();
    });

    this.btnHostSoundIntro.addEventListener('click', () => {
      kbcAudio.playIntro();
    });

    this.btnHostSoundQuestion.addEventListener('click', () => {
      kbcAudio.playQuestionMusic();
    });

    this.btnHostMute.addEventListener('click', () => {
      const isMuted = kbcAudio.toggleMute();
      this.btnHostMute.textContent = isMuted ? "🔇 Unmute" : "🔊 Mute";
    });

    // Hotkey 'H' to toggle host drawer
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key.toUpperCase() === 'H') {
        this.toggleDrawer();
      }
    });
  }

  toggleDrawer(force) {
    this.isOpen = typeof force === 'boolean' ? force : !this.isOpen;
    if (this.isOpen) {
      this.drawer.classList.add('open');
    } else {
      this.drawer.classList.remove('open');
    }
  }

  openQuestionEditor() {
    this.toggleDrawer(false);
    this.renderQuestionEditorForm();
    this.editorModal.classList.add('active');
  }

  closeQuestionEditor() {
    this.editorModal.classList.remove('active');
  }

  renderQuestionEditorForm() {
    const secSelect = document.getElementById('editSectionSelect');
    const levelSelect = document.getElementById('editLevelSelect');
    const catInput = document.getElementById('editCategoryInput');
    const textInput = document.getElementById('editQuestionTextInput');
    const opt0Input = document.getElementById('editOpt0Input');
    const opt1Input = document.getElementById('editOpt1Input');
    const opt2Input = document.getElementById('editOpt2Input');
    const opt3Input = document.getElementById('editOpt3Input');
    const correctSelect = document.getElementById('editCorrectSelect');
    const wittyInput = document.getElementById('editWittyInput');

    const updateFields = () => {
      const sec = secSelect.value;
      const lvl = parseInt(levelSelect.value, 10);
      const bank = INITIAL_QUESTION_BANK[sec] || [];
      const existing = bank.find(q => q.level === lvl);

      if (existing) {
        catInput.value = existing.category;
        textInput.value = existing.question;
        opt0Input.value = existing.options[0] || '';
        opt1Input.value = existing.options[1] || '';
        opt2Input.value = existing.options[2] || '';
        opt3Input.value = existing.options[3] || '';
        correctSelect.value = existing.correct;
        if (wittyInput) wittyInput.value = existing.wittyNote || '';
      } else {
        catInput.value = "Custom Category";
        textInput.value = "";
        opt0Input.value = "";
        opt1Input.value = "";
        opt2Input.value = "";
        opt3Input.value = "";
        correctSelect.value = 0;
        if (wittyInput) wittyInput.value = "";
      }
    };

    secSelect.onchange = updateFields;
    levelSelect.onchange = updateFields;

    // Set initial
    secSelect.value = this.game.currentSection || "Section A";
    levelSelect.value = this.game.currentLevel || 1;
    updateFields();

    document.getElementById('btnSaveCustomQuestion').onclick = () => {
      const sec = secSelect.value;
      const lvl = parseInt(levelSelect.value, 10);
      const bank = INITIAL_QUESTION_BANK[sec];

      const newQ = {
        id: `${sec[8] || 'Q'}${lvl}`,
        level: lvl,
        category: catInput.value.trim() || "Pop Culture",
        question: textInput.value.trim() || "Question text",
        options: [
          opt0Input.value.trim() || "Option A",
          opt1Input.value.trim() || "Option B",
          opt2Input.value.trim() || "Option C",
          opt3Input.value.trim() || "Option D"
        ],
        correct: parseInt(correctSelect.value, 10),
        wittyNote: wittyInput ? wittyInput.value.trim() : ""
      };

      const existingIdx = bank.findIndex(q => q.level === lvl);
      if (existingIdx >= 0) {
        bank[existingIdx] = newQ;
      } else {
        bank.push(newQ);
      }

      // If updating the active live question, reload it immediately!
      if (this.game.currentSection === sec && this.game.currentLevel === lvl) {
        this.game.loadQuestionForCurrentLevel();
      }

      this.closeQuestionEditor();
      alert(`Question for ${sec} Level ${lvl} successfully saved!`);
    };

    document.getElementById('btnCloseQuestionEditor').onclick = () => {
      this.closeQuestionEditor();
    };
  }
}

// Global host instance placeholder
let hostController = null;
