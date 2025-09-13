document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    let currentTimer = null;
    let timerInterval = null;
    let isRunning = false;
    let currentTechnique = 'pomodoro';
    let studyTime = 0;
    let totalStudyTime = 0;
    let liveStudyTime = 0;
    let liveStudyInterval = null;
    let isStudying = false;

    // Custom Cursor
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    // Ensure cursor is always visible
    cursor.style.display = 'block';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999';

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
        cursor.style.display = 'block';
    });

    // Hide cursor when mouse leaves window
    document.addEventListener('mouseleave', () => {
        cursor.style.display = 'none';
    });

    // Show cursor when mouse enters window
    document.addEventListener('mouseenter', () => {
        cursor.style.display = 'block';
    });

    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, .memory-card, .game-card, .achievement, .tip-card, .stat-card, .technique-btn, .music-tab, .timer-controls button, .game-controls button, .card-face, .level, .achievement');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });

    // Ensure all dynamically added elements also get cursor effects
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    const newInteractiveElements = node.querySelectorAll ? 
                        node.querySelectorAll('button, a, input, .memory-card, .game-card, .achievement, .tip-card, .stat-card, .technique-btn, .music-tab, .timer-controls button, .game-controls button, .card-face, .level, .achievement') : [];
                    
                    newInteractiveElements.forEach(el => {
                        el.addEventListener('mouseenter', () => {
                            cursor.classList.add('hover');
                        });
                        
                        el.addEventListener('mouseleave', () => {
                            cursor.classList.remove('hover');
                        });
                    });
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Timer techniques configuration
    const timerTechniques = {
        pomodoro: { focus: 25, break: 5, longBreak: 15 },
        '52-17': { focus: 52, break: 17, longBreak: 30 },
        '90-minute': { focus: 90, break: 20, longBreak: 30 },
        custom: { focus: 25, break: 5, longBreak: 15 }
    };

    // DOM elements
    const loginModal = document.getElementById('login-modal');
    const mobileNumberView = document.getElementById('mobile-number-view');
    const otpView = document.getElementById('otp-view');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const otpInput = document.getElementById('otp-input');
    const otpError = document.getElementById('otp-error');
    const mobileError = document.getElementById('mobile-error');
    const mainContent = document.querySelector('main');
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('main section');
    const body = document.querySelector('body');
    const otpTimerSpan = document.getElementById('otp-timer');
    const resendOtpBtn = document.getElementById('resend-otp-btn');

    // Navigation elements
    const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('nav ul');

    // Timer elements
    const timeDisplay = document.querySelector('.time-display');
    const timerMode = document.querySelector('.timer-mode');
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const resetBtn = document.getElementById('reset-timer');
    const techniqueBtns = document.querySelectorAll('.technique-btn');
    const customTimer = document.getElementById('custom-timer');
    const focusTimeInput = document.getElementById('focus-time');
    const breakTimeInput = document.getElementById('break-time');
    const timerProgress = document.querySelector('.timer-progress');

    // Profile elements
    const liveStudyTimeEl = document.getElementById('live-study-time');
    const totalStudyTimeEl = document.getElementById('total-study-time');
    const currentLevelEl = document.getElementById('current-level');
    const levelProgressEl = document.getElementById('level-progress');

    // Game elements
    const playMemoryMatchBtn = document.getElementById('play-memory-match');
    const playFocusFlowBtn = document.getElementById('play-focus-flow');
    const playReactionTimeBtn = document.getElementById('play-reaction-time');
    const memoryGameContainer = document.getElementById('memory-game-container');
    const focusFlowContainer = document.getElementById('focus-flow-container');
    const reactionTimeContainer = document.getElementById('reaction-time-container');

    let otpTimerInterval;

    // Phone number validation
    function validatePhoneNumber(phone) {
        return /^\d{10}$/.test(phone);
    }

    // Start OTP timer
    function startOtpTimer() {
        resendOtpBtn.classList.add('hidden');
        otpTimerSpan.classList.remove('hidden');
        let seconds = 30;
        otpTimerSpan.textContent = `Resend OTP in ${seconds}s`;

        otpTimerInterval = setInterval(() => {
            seconds--;
            otpTimerSpan.textContent = `Resend OTP in ${seconds}s`;
            if (seconds <= 0) {
                clearInterval(otpTimerInterval);
                otpTimerSpan.classList.add('hidden');
                resendOtpBtn.classList.remove('hidden');
            }
        }, 1000);
    }

    // Login functionality
    if (loginModal) {
        sendOtpBtn.addEventListener('click', () => {
            const mobileNumber = document.getElementById('mobile-number').value;
            mobileError.classList.add('hidden');
            
            if (!validatePhoneNumber(mobileNumber)) {
                mobileError.classList.remove('hidden');
                return;
            }
            
            mobileNumberView.classList.add('hidden');
            otpView.classList.remove('hidden');
            console.log(`OTP sent to +91${mobileNumber}`);
            startOtpTimer();
        });

        resendOtpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Resending OTP...');
            startOtpTimer();
        });

        verifyOtpBtn.addEventListener('click', () => {
            const otp = otpInput.value;
            if (otp === '1234') {
                clearInterval(otpTimerInterval);
                loginModal.style.display = 'none';
                mainContent.classList.remove('hidden');
                header.classList.remove('hidden');
                body.classList.add('loggedin');
                showSection('dashboard');
                startLiveStudyTimer();
            } else {
                otpError.classList.remove('hidden');
            }
        });
    }

    // Navigation
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
            // Close mobile menu if open
            if (navUl.classList.contains('active')) {
                navUl.classList.remove('active');
            }
        });
    });

    // Toggle mobile menu
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navUl.classList.toggle('active');
        });
    }

    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    }

    // Timer functionality
    function updateTimerDisplay(minutes, seconds) {
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeDisplay.textContent = display;
    }

    function updateProgress(remaining, total) {
        const percentage = (remaining / total) * 100;
        const circumference = 2 * Math.PI * 110;
        const offset = circumference - (percentage / 100) * circumference;
        timerProgress.style.strokeDashoffset = offset;
    }

    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        isStudying = true;
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        
        timerInterval = setInterval(() => {
            if (currentTimer <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                isStudying = false;
                startBtn.style.display = 'flex';
                pauseBtn.style.display = 'none';
                
                // Timer completed
                if (timerMode.textContent === 'Focus Time') {
                    // Start break
                    currentTimer = timerTechniques[currentTechnique].break * 60;
                    timerMode.textContent = 'Break Time';
                    updateTimerDisplay(Math.floor(currentTimer / 60), currentTimer % 60);
                    updateProgress(currentTimer, timerTechniques[currentTechnique].break * 60);
                } else {
                    // Break completed, start focus
                    currentTimer = timerTechniques[currentTechnique].focus * 60;
                    timerMode.textContent = 'Focus Time';
                    updateTimerDisplay(Math.floor(currentTimer / 60), currentTimer % 60);
                    updateProgress(currentTimer, timerTechniques[currentTechnique].focus * 60);
                }
                
                // Add to total study time
                if (timerMode.textContent === 'Focus Time') {
                    totalStudyTime += timerTechniques[currentTechnique].focus;
                    updateTotalStudyTime();
                }
                
                return;
            }
            
            currentTimer--;
            const minutes = Math.floor(currentTimer / 60);
            const seconds = currentTimer % 60;
            updateTimerDisplay(minutes, seconds);
            
            const totalTime = timerMode.textContent === 'Focus Time' ? 
                timerTechniques[currentTechnique].focus * 60 : 
                timerTechniques[currentTechnique].break * 60;
            updateProgress(currentTimer, totalTime);
        }, 1000);
    }

    function pauseTimer() {
        if (!isRunning) return;
        
        isRunning = false;
        isStudying = false;
        clearInterval(timerInterval);
        startBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
    }

    function resetTimer() {
        isRunning = false;
        isStudying = false;
        clearInterval(timerInterval);
        startBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
        
        currentTimer = timerTechniques[currentTechnique].focus * 60;
        timerMode.textContent = 'Focus Time';
        updateTimerDisplay(Math.floor(currentTimer / 60), currentTimer % 60);
        updateProgress(currentTimer, timerTechniques[currentTechnique].focus * 60);
    }

    function setTechnique(technique) {
        currentTechnique = technique;
        techniqueBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        if (technique === 'custom') {
            customTimer.classList.remove('hidden');
            timerTechniques.custom.focus = parseInt(focusTimeInput.value);
            timerTechniques.custom.break = parseInt(breakTimeInput.value);
        } else {
            customTimer.classList.add('hidden');
        }
        
        resetTimer();
    }

    // Timer event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    techniqueBtns.forEach(btn => {
        btn.addEventListener('click', (e) => setTechnique(e.target.dataset.technique));
    });

    focusTimeInput.addEventListener('change', () => {
        timerTechniques.custom.focus = parseInt(focusTimeInput.value);
        resetTimer();
    });

    breakTimeInput.addEventListener('change', () => {
        timerTechniques.custom.break = parseInt(breakTimeInput.value);
        resetTimer();
    });

    // Live study timer
    function startLiveStudyTimer() {
        liveStudyInterval = setInterval(() => {
            if (isStudying) {
                liveStudyTime++;
                const hours = Math.floor(liveStudyTime / 3600);
                const minutes = Math.floor((liveStudyTime % 3600) / 60);
                const seconds = liveStudyTime % 60;
                liveStudyTimeEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    function updateTotalStudyTime() {
        const hours = Math.floor(totalStudyTime / 60);
        const minutes = totalStudyTime % 60;
        totalStudyTimeEl.textContent = `${hours}h ${minutes}m`;
    }

    // Initialize timer
    resetTimer();

    // Music Player Logic
    const musicTabs = document.querySelectorAll('.music-tab');
    const youtubePlayer = document.getElementById('youtube-player');

    musicTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            musicTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const playlistId = tab.dataset.playlist;
            youtubePlayer.src = `https://www.youtube.com/embed/${playlistId}`;
        });
    });

    // Memory Match Game
    const cardValues = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F', 'G', 'G', 'H', 'H'];
    let flippedCards = [];
    let matchedPairs = 0;
    let memoryMoves = 0;
    let memoryStartTime = 0;
    let memoryTimer = null;

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }

    function createMemoryGameBoard() {
        shuffle(cardValues);
        const memoryGameBoard = document.getElementById('memory-game-board');
        memoryGameBoard.innerHTML = '';
        matchedPairs = 0;
        memoryMoves = 0;
        memoryStartTime = Date.now();
        
        document.getElementById('memory-moves').textContent = '0';
        document.getElementById('memory-time').textContent = '00:00';
        
        cardValues.forEach(value => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.value = value;
            card.innerHTML = `
                <div class="card-face card-back"></div>
                <div class="card-face card-front">${value}</div>
            `;
            card.addEventListener('click', flipMemoryCard);
            memoryGameBoard.appendChild(card);
        });

        // Start timer
        memoryTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - memoryStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('memory-time').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function flipMemoryCard() {
        if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
            this.classList.add('flipped');
            flippedCards.push(this);
            memoryMoves++;
            document.getElementById('memory-moves').textContent = memoryMoves;

            if (flippedCards.length === 2) {
                setTimeout(checkMemoryMatch, 1000);
            }
        }
    }

    function checkMemoryMatch() {
        const [card1, card2] = flippedCards;
        if (card1.dataset.value === card2.dataset.value) {
            card1.removeEventListener('click', flipMemoryCard);
            card2.removeEventListener('click', flipMemoryCard);
            matchedPairs++;
            if (matchedPairs === cardValues.length / 2) {
                clearInterval(memoryTimer);
                setTimeout(() => {
                    alert(`Congratulations! You completed the game in ${memoryMoves} moves!`);
                }, 500);
            }
        } else {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }
        flippedCards = [];
    }

    // Focus Flow Game
    let focusScore = 0;
    let focusTimeLeft = 30;
    let focusGameInterval = null;
    let focusTargetInterval = null;

    function startFocusFlow() {
        focusScore = 0;
        focusTimeLeft = 30;
        document.getElementById('focus-score').textContent = '0';
        document.getElementById('focus-time-display').textContent = '30';
        
        const startBtn = document.getElementById('start-focus-flow');
        startBtn.textContent = 'Playing...';
        startBtn.disabled = true;
        
        // Start game timer
        focusGameInterval = setInterval(() => {
            focusTimeLeft--;
            document.getElementById('focus-time-display').textContent = focusTimeLeft;
            
            if (focusTimeLeft <= 0) {
                endFocusFlow();
            }
        }, 1000);
        
        // Start spawning targets
        spawnFocusTarget();
    }

    function spawnFocusTarget() {
        if (focusTimeLeft <= 0) return;
        
        const target = document.getElementById('focus-target');
        const gameArea = document.getElementById('focus-game-area');
        
        // Random position
        const x = Math.random() * (gameArea.offsetWidth - 60);
        const y = Math.random() * (gameArea.offsetHeight - 60);
        
        target.style.left = x + 'px';
        target.style.top = y + 'px';
        target.classList.remove('hidden');
        
        // Remove target after 2 seconds
        setTimeout(() => {
            target.classList.add('hidden');
            if (focusTimeLeft > 0) {
                spawnFocusTarget();
            }
        }, 2000);
    }

    function endFocusFlow() {
        clearInterval(focusGameInterval);
        clearInterval(focusTargetInterval);
        document.getElementById('focus-target').classList.add('hidden');
        
        const startBtn = document.getElementById('start-focus-flow');
        startBtn.textContent = 'Start Game';
        startBtn.disabled = false;
        
        alert(`Game Over! Your score: ${focusScore}`);
    }

    // Reaction Time Game
    let reactionTimes = [];
    let reactionStartTime = 0;
    let isWaitingForReaction = false;

    function startReactionTest() {
        const target = document.getElementById('reaction-target');
        const startBtn = document.getElementById('start-reaction');
        
        startBtn.textContent = 'Wait for green...';
        startBtn.disabled = true;
        target.style.backgroundColor = '#ff6b6b';
        target.textContent = 'Wait...';
        isWaitingForReaction = true;
        
        // Random delay between 2-5 seconds
        const delay = Math.random() * 3000 + 2000;
        
        setTimeout(() => {
            if (isWaitingForReaction) {
                target.style.backgroundColor = '#4ecdc4';
                target.textContent = 'Click!';
                reactionStartTime = Date.now();
                isWaitingForReaction = false;
            }
        }, delay);
    }

    function recordReactionTime() {
        if (!isWaitingForReaction && reactionStartTime > 0) {
            const reactionTime = Date.now() - reactionStartTime;
            reactionTimes.push(reactionTime);
            
            // Update stats
            const best = Math.min(...reactionTimes);
            const average = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
            
            document.getElementById('best-reaction').textContent = best;
            document.getElementById('avg-reaction').textContent = average;
            
            // Reset for next test
            const target = document.getElementById('reaction-target');
            const startBtn = document.getElementById('start-reaction');
            
            target.style.backgroundColor = '#4ecdc4';
            target.textContent = 'Click to start';
            startBtn.textContent = 'Start Test';
            startBtn.disabled = false;
            reactionStartTime = 0;
        }
    }

    // Game event listeners
    if (playMemoryMatchBtn) {
        playMemoryMatchBtn.addEventListener('click', () => {
            showSection('games');
            memoryGameContainer.classList.remove('hidden');
            createMemoryGameBoard();
        });

        document.getElementById('reset-memory-match').addEventListener('click', () => {
            clearInterval(memoryTimer);
            createMemoryGameBoard();
        });

        document.getElementById('back-to-games').addEventListener('click', () => {
            memoryGameContainer.classList.add('hidden');
            clearInterval(memoryTimer);
        });
    }

    if (playFocusFlowBtn) {
        playFocusFlowBtn.addEventListener('click', () => {
            showSection('games');
            focusFlowContainer.classList.remove('hidden');
        });

        document.getElementById('start-focus-flow').addEventListener('click', startFocusFlow);

        document.getElementById('back-to-games-focus').addEventListener('click', () => {
            focusFlowContainer.classList.add('hidden');
            endFocusFlow();
        });
    }

    if (playReactionTimeBtn) {
        playReactionTimeBtn.addEventListener('click', () => {
            showSection('games');
            reactionTimeContainer.classList.remove('hidden');
        });

        document.getElementById('start-reaction').addEventListener('click', startReactionTest);
        document.getElementById('reaction-target').addEventListener('click', recordReactionTime);

        document.getElementById('back-to-games-reaction').addEventListener('click', () => {
            reactionTimeContainer.classList.add('hidden');
        });
    }

    // Focus target click handler
    document.getElementById('focus-target').addEventListener('click', () => {
        if (focusTimeLeft > 0) {
            focusScore++;
            document.getElementById('focus-score').textContent = focusScore;
            document.getElementById('focus-target').classList.add('hidden');
            spawnFocusTarget();
        }
    });

    // Study Rooms Functionality
    const startMatchmakingBtn = document.getElementById('start-matchmaking-btn');
    const matchmakingView = document.getElementById('matchmaking-view');
    const videoChatView = document.getElementById('video-chat-view');
    const skipBtn = document.getElementById('skip-btn');
    const nextBtn = document.getElementById('next-btn');
    const reportBtn = document.getElementById('report-btn');
    const subscriptionModal = document.getElementById('subscription-modal');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const closeSubscription = document.getElementById('close-subscription');
    const subscribeNowBtn = document.getElementById('subscribe-now');
    const oppositeGenderCheckbox = document.getElementById('opposite-gender');
    const premiumNotice = document.getElementById('premium-notice');

    let isMatchmaking = false;
    let studySessionTime = 0;
    let studySessionInterval = null;
    let nextClickCount = 0;
    const maxFreeNextClicks = 5;

    // Study Rooms Event Listeners
    if (startMatchmakingBtn) {
        console.log('Start matchmaking button found'); // Debug log
        startMatchmakingBtn.addEventListener('click', startMatchmaking);
    } else {
        console.log('Start matchmaking button NOT found'); // Debug log
    }
    
    if (matchmakingView) {
        console.log('Matchmaking view found'); // Debug log
    } else {
        console.log('Matchmaking view NOT found'); // Debug log
    }
    
    if (videoChatView) {
        console.log('Video chat view found'); // Debug log
    } else {
        console.log('Video chat view NOT found'); // Debug log
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', skipPartner);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextPartner);
    }

    if (reportBtn) {
        reportBtn.addEventListener('click', reportPartner);
    }

    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
            subscriptionModal.classList.remove('hidden');
        });
    }

    if (closeSubscription) {
        closeSubscription.addEventListener('click', () => {
            subscriptionModal.classList.add('hidden');
        });
    }

    if (subscribeNowBtn) {
        subscribeNowBtn.addEventListener('click', subscribeToPremium);
    }

    if (oppositeGenderCheckbox) {
        oppositeGenderCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                premiumNotice.style.display = 'flex';
            } else {
                premiumNotice.style.display = 'none';
            }
        });
    }

    function startMatchmaking() {
        console.log('Start matchmaking clicked'); // Debug log
        isMatchmaking = true;
        nextClickCount = 0; // Reset next click count
        
        // Hide matchmaking view and show video chat view
        if (matchmakingView) {
            matchmakingView.classList.add('hidden');
            console.log('Matchmaking view hidden'); // Debug log
        }
        
        if (videoChatView) {
            videoChatView.classList.remove('hidden');
            console.log('Video chat view shown'); // Debug log
        }
        
        // Start study session timer
        studySessionTime = 0;
        studySessionInterval = setInterval(() => {
            studySessionTime++;
            const minutes = Math.floor(studySessionTime / 60);
            const seconds = studySessionTime % 60;
            const studySessionTimeEl = document.getElementById('study-session-time');
            if (studySessionTimeEl) {
                studySessionTimeEl.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);

        // Show loading state first
        const onlineUsers = document.getElementById('online-users');
        
        if (onlineUsers) {
            onlineUsers.textContent = 'Finding Study Partner...';
        }
        
        // Simulate finding a partner with live video streams
        setTimeout(() => {
            if (onlineUsers) {
                onlineUsers.textContent = '10,288 users online';
            }
            
            // Show live video streams like Omegle
            const videoPlaceholder = document.querySelector('.video-placeholder');
            console.log('Video placeholder found:', videoPlaceholder); // Debug log
            
            if (videoPlaceholder) {
                videoPlaceholder.innerHTML = `
                    <div class="live-video-stream">
                        <div class="video-label">Study Partner</div>
                        <div class="video-feed-content">
                            <div class="partner-avatar">👨‍🎓</div>
                            <div class="live-indicator">● LIVE</div>
                        </div>
                    </div>
                `;
            }
            
            // Initialize next button text
            updateNextButtonText();
        }, 3000);
    }

    function skipPartner() {
        // Simulate skipping to next partner
        const onlineUsers = document.getElementById('online-users');
        if (onlineUsers) {
            onlineUsers.textContent = 'Finding new partner...';
        }
        
        // Show loading state for video feed
        const videoPlaceholder = document.querySelector('.video-placeholder');
        if (videoPlaceholder) {
            videoPlaceholder.innerHTML = `
                <div class="loading-spinner"></div>
                <span class="video-label">Finding Study Partner...</span>
            `;
        }
        
        setTimeout(() => {
            if (onlineUsers) {
                onlineUsers.textContent = '10,288 users online';
            }
            
            // Show new live video stream
            if (videoPlaceholder) {
                videoPlaceholder.innerHTML = `
                    <div class="live-video-stream">
                        <div class="video-label">Study Partner</div>
                        <div class="video-feed-content">
                            <div class="partner-avatar">👩‍🎓</div>
                            <div class="live-indicator">● LIVE</div>
                        </div>
                    </div>
                `;
            }
        }, 2000);
    }

    function nextPartner() {
        nextClickCount++;
        
        // Check if user has exceeded free next clicks
        if (nextClickCount > maxFreeNextClicks) {
            showPremiumModal();
            return;
        }
        
        // Update next button text to show remaining clicks
        updateNextButtonText();
        skipPartner();
    }

    function updateNextButtonText() {
        const remainingClicks = maxFreeNextClicks - nextClickCount;
        if (remainingClicks > 0) {
            nextBtn.innerHTML = `Next (${remainingClicks} left)`;
        } else {
            nextBtn.innerHTML = 'Next (Premium Required)';
            nextBtn.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
            nextBtn.style.cursor = 'not-allowed';
        }
    }

    function showPremiumModal() {
        const premiumModal = document.createElement('div');
        premiumModal.className = 'modal';
        premiumModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Upgrade to Premium</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="premium-upgrade">
                        <div class="upgrade-icon">⭐</div>
                        <h4>You've used all your free "Next" clicks!</h4>
                        <p>You've reached the limit of 5 free "Next" clicks. Upgrade to Premium to continue finding your perfect study partner.</p>
                        
                        <div class="premium-features">
                            <div class="feature-item">
                                <span class="feature-icon">♾️</span>
                                <span>Unlimited "Next" clicks</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">👥</span>
                                <span>Study with opposite gender</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">⚡</span>
                                <span>Priority matching</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🎯</span>
                                <span>Advanced filters</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🛡️</span>
                                <span>24/7 support</span>
                            </div>
                        </div>
                        
                        <div class="price-section">
                            <div class="price-display">
                                <span class="currency">₹</span>
                                <span class="amount">999</span>
                                <span class="period">/month</span>
                            </div>
                            <p class="price-note">Cancel anytime • 7-day free trial</p>
                        </div>
                        
                        <button class="upgrade-now-btn" onclick="upgradeToPremium()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                            </svg>
                            Upgrade Now
                        </button>
                        
                        <p class="continue-free">
                            <a href="#" onclick="continueWithLimitedAccess()">Continue with limited access</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(premiumModal);
        
        // Add styles for the premium modal
        const style = document.createElement('style');
        style.textContent = `
            .premium-upgrade {
                text-align: center;
                padding: 1rem;
            }
            
            .upgrade-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
                animation: bounce 2s infinite;
            }
            
            .premium-upgrade h4 {
                color: #1e40af;
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            
            .premium-upgrade p {
                color: #6b7280;
                margin-bottom: 2rem;
            }
            
            .premium-features {
                background: #f8fafc;
                border-radius: 12px;
                padding: 1.5rem;
                margin: 2rem 0;
                text-align: left;
            }
            
            .feature-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
                font-weight: 500;
            }
            
            .feature-item:last-child {
                margin-bottom: 0;
            }
            
            .feature-icon {
                font-size: 1.2rem;
                width: 24px;
                text-align: center;
            }
            
            .price-section {
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin: 2rem 0;
            }
            
            .price-display {
                display: flex;
                align-items: baseline;
                justify-content: center;
                gap: 0.25rem;
                margin-bottom: 0.5rem;
            }
            
            .currency {
                font-size: 1.5rem;
                font-weight: 600;
            }
            
            .amount {
                font-size: 3rem;
                font-weight: 800;
            }
            
            .period {
                font-size: 1.2rem;
                font-weight: 500;
            }
            
            .price-note {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9rem;
                margin: 0;
            }
            
            .upgrade-now-btn {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                color: #1e40af;
                border: none;
                padding: 1rem 2rem;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: none;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin: 0 auto 1rem;
                box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
            }
            
            .upgrade-now-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(251, 191, 36, 0.6);
            }
            
            .continue-free {
                margin: 0;
            }
            
            .continue-free a {
                color: #6b7280;
                text-decoration: none;
                font-size: 0.9rem;
            }
            
            .continue-free a:hover {
                color: #3b82f6;
            }
        `;
        document.head.appendChild(style);
    }

    // Global functions for premium modal
    window.upgradeToPremium = function() {
        alert('Redirecting to payment gateway...\n\nPremium Subscription: ₹999/month\n\nYou will be redirected to complete your payment.');
        document.querySelector('.modal').remove();
    };

    window.continueWithLimitedAccess = function() {
        alert('You can continue with limited access.\n\nNote: You have used all 5 free "Next" clicks for this session.\n\nTo get unlimited access, upgrade to Premium!');
        document.querySelector('.modal').remove();
    };

    function reportPartner() {
        alert('Thank you for reporting. We will review this user.');
        skipPartner();
    }

    function subscribeToPremium() {
        alert('Redirecting to payment gateway...\n\nPremium Subscription: ₹999/month\n\nFeatures:\n• Study with opposite gender partners\n• Priority matching\n• Advanced filters\n• 24/7 support');
        subscriptionModal.classList.add('hidden');
    }

    // Study Competitions Functionality
    const registerCompetitionBtn = document.getElementById('register-competition');

    if (registerCompetitionBtn) {
        registerCompetitionBtn.addEventListener('click', () => {
            // Show registration modal or redirect
            showCompetitionRegistration();
        });
    }

    function showCompetitionRegistration() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Register for Study Competition</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="competition-registration">
                        <div class="competition-highlight">
                            <div class="competition-icon">🏆</div>
                            <h4>National Study Marathon</h4>
                            <p class="competition-date">📅 October 15, 2024</p>
                            <p class="competition-prize">💰 Prize: ₹50,000</p>
                        </div>
                        
                        <div class="registration-form">
                            <div class="form-group">
                                <label>Full Name</label>
                                <input type="text" id="full-name" placeholder="Enter your full name">
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="email" placeholder="Enter your email">
                            </div>
                            <div class="form-group">
                                <label>Phone Number</label>
                                <input type="tel" id="phone" placeholder="Enter your phone number">
                            </div>
                            <div class="form-group">
                                <label>Study Level</label>
                                <select id="study-level">
                                    <option value="">Select your study level</option>
                                    <option value="high-school">High School</option>
                                    <option value="undergraduate">Undergraduate</option>
                                    <option value="postgraduate">Postgraduate</option>
                                    <option value="professional">Professional</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Study Goals</label>
                                <textarea id="study-goals" placeholder="What do you hope to achieve in this competition?"></textarea>
                            </div>
                            
                            <div class="terms-checkbox">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="terms">
                                    <span class="checkmark"></span>
                                    I agree to the <a href="#" class="terms-link">Terms and Conditions</a>
                                </label>
                            </div>
                            
                            <button class="submit-registration-btn" onclick="submitRegistration()">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                Register Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add styles for the modal
        const style = document.createElement('style');
        style.textContent = `
            .competition-registration {
                text-align: center;
            }
            
            .competition-highlight {
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }
            
            .competition-highlight h4 {
                margin: 1rem 0;
                font-size: 1.5rem;
                font-weight: 700;
            }
            
            .competition-highlight p {
                margin: 0.5rem 0;
                font-size: 1.1rem;
            }
            
            .registration-form {
                text-align: left;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #374151;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .terms-checkbox {
                margin: 2rem 0;
            }
            
            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: none;
                font-size: 0.9rem;
            }
            
            .checkbox-label input[type="checkbox"] {
                display: none;
            }
            
            .checkmark {
                width: 20px;
                height: 20px;
                border: 2px solid #d1d5db;
                border-radius: 4px;
                position: relative;
                transition: all 0.3s ease;
            }
            
            .checkbox-label input[type="checkbox"]:checked + .checkmark {
                background: #3b82f6;
                border-color: #3b82f6;
            }
            
            .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: bold;
            }
            
            .terms-link {
                color: #3b82f6;
                text-decoration: none;
            }
            
            .submit-registration-btn {
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: none;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin: 0 auto;
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
            }
            
            .submit-registration-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
            }
        `;
        document.head.appendChild(style);
    }

    // Global function for registration submission
    window.submitRegistration = function() {
        const fullName = document.getElementById('full-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const studyLevel = document.getElementById('study-level').value;
        const studyGoals = document.getElementById('study-goals').value;
        const terms = document.getElementById('terms').checked;

        if (!fullName || !email || !phone || !studyLevel || !terms) {
            alert('Please fill in all required fields and accept the terms.');
            return;
        }

        // Simulate registration
        alert(`Registration Successful! 🎉\n\nCompetition: National Study Marathon\nDate: October 15, 2024\nPrize: ₹50,000\n\nYou will receive a confirmation email shortly.`);
        
        // Close modal
        document.querySelector('.modal').remove();
    };

    // Initialize total study time
    updateTotalStudyTime();
});