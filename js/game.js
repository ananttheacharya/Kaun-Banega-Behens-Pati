/**
 * KAUN BANEGA CROREPATI - BIT JAIPUR EDITION
 * Core Game Engine & State Machine
 */

class KBCGame {
  constructor() {
    this.currentSection = null;
    this.contestants = {
      "Section A": { names: "Contestants A", score: 0, completed: false, levelReached: 0 },
      "Section B": { names: "Contestants B", score: 0, completed: false, levelReached: 0 },
      "Section C": { names: "Contestants C", score: 0, completed: false, levelReached: 0 }
    };

    this.currentLevel = 1;
    this.currentQuestion = null;
    this.selectedOptionIndex = null;
    this.isOptionLocked = false;
    this.isAnswerRevealed = false;

    // Lifeline states for current round
    this.lifelines = {
      fiftyFifty: true,
      phoneFriend: true,
      audiencePoll: true,
      askExpert: true
    };

    // Timer settings
    this.timerSeconds = 45;
    this.timerInterval = null;
    this.isTimerPaused = false;

    this.initDOM();
    this.loadStateFromStorage();
  }

  initDOM() {
    // Top bar elements
    this.pointsDisplay = document.getElementById('pointsVal');
    this.walkAwayBtn = document.getElementById('btnWalkAway');

    // Lifeline buttons
    this.btn5050 = document.getElementById('btn5050');
    this.btnPhone = document.getElementById('btnPhone');
    this.btnPoll = document.getElementById('btnPoll');
    this.btnExpert = document.getElementById('btnExpert');

    // Arena elements
    this.teamBadge = document.getElementById('teamSectionBadge');
    this.teamContestants = document.getElementById('teamContestants');
    this.timerSecondsDisplay = document.getElementById('timerSeconds');
    this.timerProgressCircle = document.getElementById('timerProgressCircle');
    this.ladderList = document.getElementById('ladderList');

    // Question & options
    this.questionCategoryTag = document.getElementById('questionCategoryTag');
    this.questionText = document.getElementById('questionText');
    this.optionBtns = [
      document.getElementById('optA'),
      document.getElementById('optB'),
      document.getElementById('optC'),
      document.getElementById('optD')
    ];

    // Modals
    this.startModal = document.getElementById('startModal');
    this.lifelineModal = document.getElementById('lifelineModal');
    this.roundOverModal = document.getElementById('roundOverModal');
    this.finaleModal = document.getElementById('finaleModal');
    this.wittyToast = document.getElementById('wittyToast');

    this.bindEvents();
    this.renderLadder();
  }

  bindEvents() {
    // Option clicks
    this.optionBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => this.handleOptionClick(index));
    });

    // Walk away
    this.walkAwayBtn.addEventListener('click', () => this.handleWalkAway());

    // Lifelines
    this.btn5050.addEventListener('click', () => this.use5050());
    this.btnPhone.addEventListener('click', () => this.usePhoneAFriend());
    this.btnPoll.addEventListener('click', () => this.useAudiencePoll());
    this.btnExpert.addEventListener('click', () => this.useAskTheExpert());

    // Keyboard shortcuts for Host / Game runner
    document.addEventListener('keydown', (e) => this.handleGlobalKeypress(e));
  }

  loadStateFromStorage() {
    try {
      const saved = localStorage.getItem('kbc_bit_jaipur_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.contestants) {
          this.contestants = parsed.contestants;
        }
      }
    } catch (e) {
      console.warn('Could not load local storage:', e);
    }
  }

  saveStateToStorage() {
    try {
      const state = {
        contestants: this.contestants,
        currentSection: this.currentSection,
        currentLevel: this.currentLevel
      };
      localStorage.setItem('kbc_bit_jaipur_state', JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save to local storage:', e);
    }
  }

  // ==========================================
  // LADDER & POINTS DISPLAY
  // ==========================================
  renderLadder() {
    this.ladderList.innerHTML = '';
    // Render top-down (Level 15 down to Level 1)
    [...KBC_LADDER].reverse().forEach(step => {
      const div = document.createElement('div');
      div.className = `ladder-step ${step.isMilestone ? 'milestone' : ''}`;
      div.id = `ladder-step-${step.level}`;

      div.innerHTML = `
        <div class="step-left">
          <span class="step-indicator">►</span>
          <span class="step-points">${step.display} PTS</span>
        </div>
        <span class="step-level">${step.level}</span>
      `;
      this.ladderList.appendChild(div);
    });
  }

  updateLadderActive() {
    KBC_LADDER.forEach(step => {
      const el = document.getElementById(`ladder-step-${step.level}`);
      if (!el) return;

      el.classList.remove('active', 'completed');
      if (step.level === this.currentLevel) {
        el.classList.add('active');
      } else if (step.level < this.currentLevel) {
        el.classList.add('completed');
      }
    });

    // Update current points capsule in top bar
    const currentPoints = this.calculateCurrentBankedPoints();
    this.pointsDisplay.textContent = `${currentPoints.toLocaleString('en-IN')} PTS`;
  }

  calculateCurrentBankedPoints() {
    if (this.currentLevel <= 1) return 0;
    const prev = KBC_LADDER.find(s => s.level === this.currentLevel - 1);
    return prev ? prev.points : 0;
  }

  calculateSafeMilestonePoints() {
    // Milestone 2 (Level 10): 3,20,000 pts
    if (this.currentLevel > 10) return 320000;
    // Milestone 1 (Level 5): 10,000 pts
    if (this.currentLevel > 5) return 10000;
    return 0;
  }

  // ==========================================
  // STARTING A ROUND FOR A SECTION
  // ==========================================
  startSectionRound(sectionKey, contestantNames) {
    this.currentSection = sectionKey;
    this.contestants[sectionKey].names = contestantNames || `${sectionKey} Champions`;

    this.teamBadge.textContent = sectionKey.toUpperCase();
    this.teamContestants.textContent = this.contestants[sectionKey].names;

    // Reset lifelines for the new section
    this.lifelines = {
      fiftyFifty: true,
      phoneFriend: true,
      audiencePoll: true,
      askExpert: true
    };
    this.updateLifelineUI();

    // Reset to Level 1
    this.currentLevel = 1;
    this.updateLadderActive();

    // Close start modal
    this.startModal.classList.remove('active');

    // Load first question
    this.loadQuestionForCurrentLevel();
  }

  loadQuestionForCurrentLevel() {
    this.resetQuestionState();

    // Retrieve questions for this section
    const sectionBank = INITIAL_QUESTION_BANK[this.currentSection] || INITIAL_QUESTION_BANK["Section A"];
    const qData = sectionBank.find(q => q.level === this.currentLevel) || sectionBank[0];

    this.currentQuestion = prepareQuestionForDisplay(qData);

    // Play starting music for this question tier
    kbcAudio.playQuestionMusic();
    if (stageEffect) stageEffect.setMode('ambient');

    // Render Question & Options
    this.questionCategoryTag.textContent = this.currentQuestion.category;
    this.questionText.textContent = this.currentQuestion.question;

    this.currentQuestion.formattedOptions.forEach((opt, idx) => {
      const btn = this.optionBtns[idx];
      btn.querySelector('.option-text').textContent = opt.text;
      btn.className = 'option-btn'; // reset states
    });

    this.updateLadderActive();

    // Start countdown timer based on points ladder:
    // Level 1-5 (1k to 10k): 30s | Level 6-10 (20k to 3.2L): 60s | Level 11-15 (>3.2L): 90s
    const timerDuration = this.getTimerDurationForLevel(this.currentLevel);
    this.startTimer(timerDuration);
  }

  getTimerDurationForLevel(level) {
    if (level <= 5) return 30;   // 1,000 to 10,000 PTS: 30s
    if (level <= 10) return 60;  // 20,000 to 3,20,000 PTS: 60s
    return 90;                   // Above 3,20,000 PTS (6.4L to 1 Crore): 90s
  }

  resetQuestionState() {
    this.selectedOptionIndex = null;
    this.isOptionLocked = false;
    this.isAnswerRevealed = false;
    this.hideWittyToast();
    this.stopTimer();

    // Remove any previous time-up red accent
    const widget = document.querySelector('.kbc-timer-widget');
    if (widget) widget.classList.remove('time-up');

    this.optionBtns.forEach(btn => {
      btn.className = 'option-btn';
    });
  }

  // ==========================================
  // TIMER ENGINE
  // ==========================================
  startTimer(duration) {
    this.stopTimer();
    this.totalTimerDuration = duration;
    this.timerSeconds = duration;

    const widget = document.querySelector('.kbc-timer-widget');
    if (widget) widget.classList.remove('time-up');

    this.updateTimerDisplay();

    // Start background timer ticking track
    kbcAudio.playTimerMusic();

    this.timerInterval = setInterval(() => {
      if (this.isTimerPaused) return;

      this.timerSeconds--;
      this.updateTimerDisplay();

      if (this.timerSeconds <= 0) {
        this.handleTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    kbcAudio.stopTimerMusic();
  }

  pauseTimer() {
    this.isTimerPaused = true;
    kbcAudio.pauseTimerMusic();
  }

  resumeTimer() {
    this.isTimerPaused = false;
    kbcAudio.resumeTimerMusic();
  }

  updateTimerDisplay() {
    this.timerSecondsDisplay.textContent = Math.max(0, this.timerSeconds);
    const totalSecs = this.totalTimerDuration || 30;
    const fraction = Math.max(0, this.timerSeconds) / totalSecs;
    const circumference = 345;
    const offset = circumference - (fraction * circumference);

    this.timerProgressCircle.style.strokeDashoffset = offset;

    this.timerProgressCircle.classList.remove('warning', 'danger');
    if (this.timerSeconds <= 10) {
      this.timerProgressCircle.classList.add('danger');
    } else if (this.timerSeconds <= 20) {
      this.timerProgressCircle.classList.add('warning');
    }
  }

  handleTimeUp() {
    this.stopTimer();
    this.timerSeconds = 0;
    this.updateTimerDisplay();

    // Simply add a red accent to the clock, do not have a pop up saying time is up
    const widget = document.querySelector('.kbc-timer-widget');
    if (widget) {
      widget.classList.add('time-up');
    }

    kbcAudio.playWrongSound();
    if (stageEffect) stageEffect.setMode('wrong');
  }

  // ==========================================
  // OPTION INTERACTION & LOCKING
  // ==========================================
  handleOptionClick(index) {
    if (this.isOptionLocked || this.isAnswerRevealed) return;

    const btn = this.optionBtns[index];
    if (btn.classList.contains('eliminated')) return; // 50-50 eliminated

    if (this.selectedOptionIndex === index) {
      // Clicking the already selected option confirms lock
      this.lockCurrentSelection();
      return;
    }

    // Select or toggle
    this.optionBtns.forEach(b => b.classList.remove('locked'));
    btn.classList.add('locked');
    this.selectedOptionIndex = index;

    // Suspense lock sound
    kbcAudio.playLockSound();
    if (stageEffect) stageEffect.setMode('locked');

    // Pause timer music on selection
    kbcAudio.pauseTimerMusic();
  }

  lockCurrentSelection() {
    if (this.selectedOptionIndex === null || this.isOptionLocked) return;

    this.isOptionLocked = true;
    this.stopTimer();
    kbcAudio.playLockSound();
    if (stageEffect) stageEffect.setMode('locked');
  }

  revealAnswer() {
    if (this.selectedOptionIndex === null || this.isAnswerRevealed) return;

    this.isOptionLocked = true;
    this.isAnswerRevealed = true;
    this.stopTimer();

    const selectedOpt = this.currentQuestion.formattedOptions[this.selectedOptionIndex];
    const correctIndex = this.currentQuestion.formattedOptions.findIndex(o => o.isCorrect);

    if (selectedOpt.isCorrect) {
      // CORRECT ANSWER
      this.optionBtns[this.selectedOptionIndex].classList.remove('locked');
      this.optionBtns[this.selectedOptionIndex].classList.add('correct');

      kbcAudio.playCorrectSound();
      if (stageEffect) stageEffect.setMode('correct');

      // Show Witty Trivia Toast
      if (this.currentQuestion.wittyNote) {
        this.showWittyToast(this.currentQuestion.wittyNote);
      }

      // Check if jackpot reached
      if (this.currentLevel === 15) {
        setTimeout(() => {
          this.handleJackpotWin();
        }, 3000);
      } else {
        // Advance to next question after celebration
        setTimeout(() => {
          this.currentLevel++;
          this.loadQuestionForCurrentLevel();
        }, 3200);
      }
    } else {
      // WRONG ANSWER
      this.optionBtns[this.selectedOptionIndex].classList.remove('locked');
      this.optionBtns[this.selectedOptionIndex].classList.add('wrong');
      // Highlight the actual correct answer
      this.optionBtns[correctIndex].classList.add('correct');

      kbcAudio.playWrongSound();
      if (stageEffect) stageEffect.setMode('wrong');

      if (this.currentQuestion.wittyNote) {
        this.showWittyToast(this.currentQuestion.wittyNote);
      }

      const safePoints = this.calculateSafeMilestonePoints();
      setTimeout(() => {
        this.handleWrongAnswerEnd(safePoints);
      }, 3500);
    }
  }

  handleWrongAnswerEnd(safePoints) {
    this.contestants[this.currentSection].score = safePoints;
    this.contestants[this.currentSection].completed = true;
    this.contestants[this.currentSection].levelReached = this.currentLevel;
    this.saveStateToStorage();

    this.showRoundOverModal(
      "GALAT JAWAB!",
      `Tough luck on Question ${this.currentLevel}! According to KBC rules, ${this.currentSection} banks safe milestone points: ${safePoints.toLocaleString('en-IN')} PTS.`
    );
  }

  handleWalkAway() {
    if (this.isAnswerRevealed) return;

    const banked = this.calculateCurrentBankedPoints();
    this.stopTimer();
    kbcAudio.playIntro();

    this.contestants[this.currentSection].score = banked;
    this.contestants[this.currentSection].completed = true;
    this.contestants[this.currentSection].levelReached = this.currentLevel - 1;
    this.saveStateToStorage();

    this.showRoundOverModal(
      "WALK AWAY ACCEPTED!",
      `${this.currentSection} chooses wisdom and walks away with their hard-earned ${banked.toLocaleString('en-IN')} PTS!`
    );
  }

  handleJackpotWin() {
    const jackpotPoints = 10000000;
    this.contestants[this.currentSection].score = jackpotPoints;
    this.contestants[this.currentSection].completed = true;
    this.contestants[this.currentSection].levelReached = 15;
    this.saveStateToStorage();

    if (stageEffect) stageEffect.setMode('finale');

    this.showRoundOverModal(
      "1 CRORE POINTS UNLOCKED! 🏆",
      `HISTORIC MOMENT! ${this.currentSection} has successfully cleared all 15 questions of KBC BIT Jaipur edition!`
    );
  }

  // ==========================================
  // LIFELINES LOGIC
  // ==========================================
  use5050() {
    if (!this.lifelines.fiftyFifty || this.isAnswerRevealed) return;

    this.lifelines.fiftyFifty = false;
    this.updateLifelineUI();
    kbcAudio.playLifeline5050();

    // Identify 2 wrong options and eliminate them
    const wrongIndices = [];
    this.currentQuestion.formattedOptions.forEach((opt, idx) => {
      if (!opt.isCorrect) wrongIndices.push(idx);
    });

    // Pick 2 random wrong options
    wrongIndices.sort(() => Math.random() - 0.5);
    const toEliminate = wrongIndices.slice(0, 2);

    toEliminate.forEach(idx => {
      this.optionBtns[idx].classList.add('eliminated');
    });
  }

  usePhoneAFriend() {
    if (!this.lifelines.phoneFriend || this.isAnswerRevealed) return;

    this.lifelines.phoneFriend = false;
    this.updateLifelineUI();
    kbcAudio.playPhoneRing();
    this.pauseTimer();

    this.showLifelineModal(
      "CALL A FRIEND 📞",
      `Calling a classmate from ${this.currentSection}! You have 30 seconds to speak and get their advice. Time starts now!`,
      30
    );
  }

  useAudiencePoll() {
    if (!this.lifelines.audiencePoll || this.isAnswerRevealed) return;

    this.lifelines.audiencePoll = false;
    this.updateLifelineUI();
    kbcAudio.playAudienceDrumroll();
    this.pauseTimer();

    // Open Audience Poll Modal with interactive voting bars
    this.showAudiencePollModal();
  }

  useAskTheExpert() {
    if (!this.lifelines.askExpert || this.isAnswerRevealed) return;

    this.lifelines.askExpert = false;
    this.updateLifelineUI();
    kbcAudio.playIntro();
    this.pauseTimer();

    this.showLifelineModal(
      "ASK THE EXPERT 🎓",
      `Inviting our 2 Offline Experts to consult on Question ${this.currentLevel}! Experts, please share your wisdom with the contestants.`,
      60
    );
  }

  updateLifelineUI() {
    if (!this.lifelines.fiftyFifty) this.btn5050.classList.add('used');
    else this.btn5050.classList.remove('used');

    if (!this.lifelines.phoneFriend) this.btnPhone.classList.add('used');
    else this.btnPhone.classList.remove('used');

    if (!this.lifelines.audiencePoll) this.btnPoll.classList.add('used');
    else this.btnPoll.classList.remove('used');

    if (!this.lifelines.askExpert) this.btnExpert.classList.add('used');
    else this.btnExpert.classList.remove('used');
  }

  // ==========================================
  // MODALS & OVERLAYS
  // ==========================================
  showLifelineModal(title, text, durationSecs) {
    this.lifelineModal.querySelector('.modal-title').textContent = title;
    this.lifelineModal.querySelector('.modal-subtitle').textContent = text;
    this.lifelineModal.querySelector('#lifelineModalContent').innerHTML = `
      <div style="font-size: 38px; font-weight: 800; font-family: var(--font-display); color: var(--kbc-cyan); margin: 15px 0;">
        <span id="lifelineCountdown">${durationSecs}</span>s
      </div>
      <button class="btn-primary-action" id="btnResumeGame">Resume Hot Seat</button>
    `;

    this.lifelineModal.classList.add('active');

    let left = durationSecs;
    const countEl = document.getElementById('lifelineCountdown');
    const timer = setInterval(() => {
      left--;
      if (countEl) countEl.textContent = left;
      if (left <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    document.getElementById('btnResumeGame').onclick = () => {
      clearInterval(timer);
      this.lifelineModal.classList.remove('active');
      this.resumeTimer();
    };
  }

  showAudiencePollModal() {
    this.lifelineModal.querySelector('.modal-title').textContent = "AUDIENCE POLL 👥";
    this.lifelineModal.querySelector('.modal-subtitle').textContent =
      `Audience Poll in progress! Contestants on the hot seat are taking the opinion of the auditorium.`;

    this.lifelineModal.querySelector('#lifelineModalContent').innerHTML = `
      <div class="audience-poll-prompt-box">
        <div class="poll-instruction-badge">HANDS-UP VOTING</div>
        <p class="poll-instruction-text">
          Audience & Classmates, please raise your hands for Option <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, or <strong>D</strong> as the host calls them out!
        </p>
        <div class="poll-options-preview">
          <div class="poll-opt-chip"><span class="chip-letter">A:</span> ${this.currentQuestion.formattedOptions[0].text}</div>
          <div class="poll-opt-chip"><span class="chip-letter">B:</span> ${this.currentQuestion.formattedOptions[1].text}</div>
          <div class="poll-opt-chip"><span class="chip-letter">C:</span> ${this.currentQuestion.formattedOptions[2].text}</div>
          <div class="poll-opt-chip"><span class="chip-letter">D:</span> ${this.currentQuestion.formattedOptions[3].text}</div>
        </div>
      </div>
      <button class="btn-primary-action" id="btnResumeGamePoll" style="margin-top: 14px;">Back to Hot Seat</button>
    `;

    this.lifelineModal.classList.add('active');

    document.getElementById('btnResumeGamePoll').onclick = () => {
      this.lifelineModal.classList.remove('active');
      this.resumeTimer();
    };
  }

  showRoundOverModal(title, summary) {
    this.roundOverModal.querySelector('.modal-title').textContent = title;
    this.roundOverModal.querySelector('.modal-subtitle').textContent = summary;

    const isAllDone = Object.values(this.contestants).every(c => c.completed);
    const nextBtn = document.getElementById('btnNextRound');

    if (isAllDone) {
      nextBtn.textContent = "View Grand Finale Leaderboard 🏆";
      nextBtn.onclick = () => {
        this.roundOverModal.classList.remove('active');
        this.showGrandFinaleModal();
      };
    } else {
      nextBtn.textContent = "Move to Next Section ➡️";
      nextBtn.onclick = () => {
        this.roundOverModal.classList.remove('active');
        this.showStartModal();
      };
    }

    this.roundOverModal.classList.add('active');
  }

  showStartModal() {
    this.startModal.classList.add('active');
    // Pre-fill next uncompleted section
    const sections = ["Section A", "Section B", "Section C"];
    const uncompleted = sections.find(s => !this.contestants[s].completed) || "Section A";

    const buttons = document.querySelectorAll('.section-card-btn');
    buttons.forEach(b => {
      const sec = b.getAttribute('data-section');
      b.classList.remove('selected');
      if (sec === uncompleted) b.classList.add('selected');

      const statusEl = b.querySelector('.section-card-status');
      if (this.contestants[sec].completed) {
        statusEl.textContent = `Completed (${this.contestants[sec].score.toLocaleString('en-IN')} PTS)`;
      } else {
        statusEl.textContent = `Ready for Hot Seat`;
      }
    });

    document.getElementById('contestant1Input').value = "";
    document.getElementById('contestant2Input').value = "";
  }

  showGrandFinaleModal() {
    const list = Object.entries(this.contestants).map(([sec, data]) => ({
      section: sec,
      score: data.score,
      names: data.names
    }));

    // Sort highest score first
    list.sort((a, b) => b.score - a.score);

    const podium = document.getElementById('finalePodium');
    podium.innerHTML = `
      <!-- Rank 2 -->
      <div class="podium-slot rank-2">
        <div class="podium-section-name">${list[1]?.section || 'Section'}</div>
        <div class="podium-score">${(list[1]?.score || 0).toLocaleString('en-IN')} PTS</div>
        <div class="podium-box">
          <div class="podium-rank">2</div>
        </div>
      </div>
      <!-- Rank 1 (Winner) -->
      <div class="podium-slot rank-1">
        <div style="font-size: 26px; margin-bottom: 4px;">👑</div>
        <div class="podium-section-name" style="font-size: 20px; color: var(--kbc-gold);">${list[0]?.section || 'Section'}</div>
        <div class="podium-score" style="color: #ffd466; font-size: 16px;">${(list[0]?.score || 0).toLocaleString('en-IN')} PTS</div>
        <div class="podium-box">
          <div class="podium-rank">1</div>
        </div>
      </div>
      <!-- Rank 3 -->
      <div class="podium-slot rank-3">
        <div class="podium-section-name">${list[2]?.section || 'Section'}</div>
        <div class="podium-score">${(list[2]?.score || 0).toLocaleString('en-IN')} PTS</div>
        <div class="podium-box">
          <div class="podium-rank">3</div>
        </div>
      </div>
    `;

    kbcAudio.playIntro();
    if (stageEffect) stageEffect.setMode('finale');
    this.finaleModal.classList.add('active');
  }

  showWittyToast(msg) {
    this.wittyToast.textContent = msg;
    this.wittyToast.classList.add('show');
  }

  hideWittyToast() {
    this.wittyToast.classList.remove('show');
  }

  // ==========================================
  // GLOBAL KEYBOARD SHORTCUTS FOR HOST
  // ==========================================
  handleGlobalKeypress(e) {
    // Prevent typing inside inputs from triggering shortcuts
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toUpperCase();

    if (key === ' ' || key === 'SPACEBAR') {
      // Space: Pause/Resume Timer
      e.preventDefault();
      if (this.isTimerPaused) this.resumeTimer();
      else this.pauseTimer();
    } else if (key === 'L') {
      // L: Lock selected option
      this.lockCurrentSelection();
    } else if (key === 'R') {
      // R: Reveal answer
      this.revealAnswer();
    } else if (key === 'N') {
      // N: Skip / Advance question
      if (this.currentLevel < 15) {
        this.currentLevel++;
        this.loadQuestionForCurrentLevel();
      }
    } else if (key === '1' || key === 'A') {
      this.handleOptionClick(0);
    } else if (key === '2' || key === 'B') {
      this.handleOptionClick(1);
    } else if (key === '3' || key === 'C') {
      this.handleOptionClick(2);
    } else if (key === '4' || key === 'D') {
      this.handleOptionClick(3);
    }
  }
}

// Global game instance
let kbcGame = null;
