const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days exactly

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const taskList = document.getElementById("task-list");
    const newTaskInput = document.getElementById("new-task-input");
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    const countdownEl = document.getElementById("countdown");
    
    // Modal Elements
    const modalOverlay = document.getElementById("result-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    const modalIcon = document.getElementById("modal-icon");
    const modalPunishmentBox = document.getElementById("modal-punishment-box");
    const resetBtn = document.getElementById("reset-week-btn");
    
    // Application State
    let tasks = [];
    let weekEndTime = 0;
    let weekActive = true;

    // Initialize the Application
    function init() {
        // Changed key to override previous local storage and load the new LeadHunter tasks
        const storedTasks = localStorage.getItem("agencyRoutineTasks_v2");
        const storedEndTime = localStorage.getItem("agencyRoutineEndTime");

        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        } else {
            // Default tasks mapped from the LeadHunter pipeline & user requests
            tasks = [
                {
                    id: 1, text: "Install Python 3.11 & Validate", completed: false,
                    instruction: "Download from python.org, check 'Add Python to PATH', and verify via cmd: `python --version`.",
                    tip: "Productivity Hack: Use keyboard shortcuts like Win+R -> cmd to instantly open your terminal."
                },
                {
                    id: 2, text: "Download, Extract & Prep LeadHunter", completed: false,
                    instruction: "Extract leadhunter.zip to your C: drive and verify folders (app, scrapers, data).",
                    tip: "Productivity Hack: Maintain a strictly organized workspace hierarchy to eliminate 'where did I put that?' mental fatigue."
                },
                {
                    id: 3, text: "Quick Break: Pray Salah / Meditate (5-10m)", completed: false,
                    instruction: "Step away from the screen entirely. Pray your Salah or do a mindfulness meditation.",
                    tip: "Mindset Hack: A complete mental reset increases your cognitive capacity for the next block of deep work."
                },
                {
                    id: 4, text: "Install Python Dependencies & Playwright", completed: false,
                    instruction: "Run `pip install -r requirements.txt` and `playwright install chromium` in the terminal.",
                    tip: "Productivity Hack: Batch terminal commands with '&&' so you can step away while the machine does the fetching."
                },
                {
                    id: 5, text: "Initialize the Database", completed: false,
                    instruction: "Run `python -m app.init_db` and verify the data/leads.db file appears in the folder.",
                    tip: "Productivity Hack: Immediate verification after execution prevents compound errors later down the line."
                },
                {
                    id: 6, text: "Set up ADB for Phone IP Rotation", completed: false,
                    instruction: "Download Android platform-tools, add to PATH, enable USB Debugging & Tethering on your phone, then verify with `adb devices`.",
                    tip: "Productivity Hack: Document your setup processes locally. Setting up future machines will take a fraction of the time."
                },
                {
                    id: 7, text: "Quick Break: Short Walk & Stretch (5m)", completed: false,
                    instruction: "Physically stand up, walk around the room, and stretch your legs and lower back.",
                    tip: "Physical Hack: Movement pumps blood and oxygen to the brain, preventing the mid-day biological crash."
                },
                {
                    id: 8, text: "Start Flask Server & Test UI", completed: false,
                    instruction: "Run `python -m app.server`, go to localhost:5000 in your browser, and test the IP rotation button.",
                    tip: "Productivity Hack: Keep your terminal and browser split-screened so you can monitor logs and UI concurrently."
                },
                {
                    id: 9, text: "Run Small Discovery Batch (5 Leads)", completed: false,
                    instruction: "Edit config.py to LEADS_PER_RUN = 5, select niche/revenue, and fire 'Start Discovery'.",
                    tip: "Productivity Hack: Always fail fast. Test minimal batches first to validate the pipeline before scaling up."
                },
                {
                    id: 10, text: "Run Full Pipeline on Small Batch", completed: false,
                    instruction: "Increase LEADS_PER_RUN to 20. Run all 4 stages sequentially, then export to CSV.",
                    tip: "Productivity Hack: Use the pipeline wait times to do asynchronous micro-tasks."
                },
                {
                    id: 11, text: "Overnight Batch & Manual Qualification", completed: false,
                    instruction: "Set LEADS_PER_RUN to 200, start overnight. Next AM: filter CSV for brands with 10+ ads.",
                    tip: "Productivity Hack: Asynchronous scaling. Let the machine do 8 hours of heavy lifting while you sleep."
                },
                {
                    id: 12, text: "Leonardo AI Prompt Engineering", completed: false,
                    instruction: "Spend 2 hours engineering JSON prompts for 8K photorealistic supplement imagery.",
                    tip: "Productivity Hack: Timebox creative tasks with a strict timer to avoid perfectionism rabbit holes."
                },
                {
                    id: 13, text: "AI Migration & Andromeda System Scripts", completed: false,
                    instruction: "Map commands to use API instead of web subscriptions. Draft scripts for 50+ video variations.",
                    tip: "Productivity Hack: Automating asset generation has a high upfront cost but yields exponential long-term output."
                }
            ];
        }

        if (storedEndTime) {
            weekEndTime = parseInt(storedEndTime, 10);
        } else {
            startNewWeek();
        }

        renderTasks();
        
        // Start countdown loop
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    // Save state to local storage
    function saveState() {
        localStorage.setItem("agencyRoutineTasks_v2", JSON.stringify(tasks));
        localStorage.setItem("agencyRoutineEndTime", weekEndTime.toString());
        updateProgress();
    }

    // Render the task list
    function renderTasks() {
        taskList.innerHTML = "";
        
        tasks.forEach((task) => {
            const taskItem = document.createElement("div");
            taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
            
            // Build inner HTML with instruction and tip if they exist
            let detailsHtml = '';
            if (task.instruction || task.tip) {
                detailsHtml = `<div class="task-details">`;
                if (task.instruction) {
                    detailsHtml += `<div class="task-instruction"><i class="fa-solid fa-list-ul"></i> <span>${task.instruction}</span></div>`;
                }
                if (task.tip) {
                    detailsHtml += `<div class="task-tip"><i class="fa-solid fa-bolt"></i> <span>${task.tip}</span></div>`;
                }
                detailsHtml += `</div>`;
            }

            taskItem.innerHTML = `
                <div class="task-checkbox-container">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
                </div>
                <div class="task-content">
                    <span class="task-text" contenteditable="true">${task.text}</span>
                    ${detailsHtml}
                </div>
                <button class="task-delete"><i class="fa-solid fa-trash"></i></button>
            `;

            // Checkbox event
            const checkbox = taskItem.querySelector(".task-checkbox");
            checkbox.addEventListener("change", (e) => {
                task.completed = e.target.checked;
                saveState();
                renderTasks();
                checkWeeklyCompletion();
            });

            // Edit text content event
            const taskTextSpan = taskItem.querySelector(".task-text");
            taskTextSpan.addEventListener("blur", (e) => {
                const newText = e.target.innerText.trim();
                if (newText) {
                    task.text = newText;
                    saveState();
                } else {
                    e.target.innerText = task.text; // revert if empty
                }
            });
            taskTextSpan.addEventListener("keydown", (e) => {
                if(e.key === 'Enter') {
                    e.preventDefault();
                    taskTextSpan.blur();
                }
            });

            // Delete event
            const deleteBtn = taskItem.querySelector(".task-delete");
            deleteBtn.addEventListener("click", () => {
                tasks = tasks.filter(t => t.id !== task.id);
                saveState();
                renderTasks();
            });

            taskList.appendChild(taskItem);
        });
        
        updateProgress();
    }

    // Add a new basic task
    function addTask(text) {
        if (!text.trim()) return;
        
        const newTask = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            instruction: "",
            tip: ""
        };
        
        tasks.push(newTask);
        saveState();
        renderTasks();
        newTaskInput.value = "";
    }

    // Add task event listener on enter
    newTaskInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTask(newTaskInput.value);
        }
    });

    // Update Progress Bar
    function updateProgress() {
        if (tasks.length === 0) {
            progressBar.style.width = "0%";
            progressText.innerText = "0% Completed";
            return;
        }
        
        const completedCount = tasks.filter(t => t.completed).length;
        const percentage = Math.round((completedCount / tasks.length) * 100);
        
        progressBar.style.width = `${percentage}%`;
        progressText.innerText = `${percentage}% Completed (${completedCount}/${tasks.length})`;
    }

    // Start a brand new week
    function startNewWeek() {
        weekEndTime = Date.now() + WEEK_IN_MS;
        weekActive = true;
        
        // Reset all tasks to incomplete
        tasks.forEach(t => t.completed = false);
        
        saveState();
        renderTasks();
        modalOverlay.classList.remove("active");
        
        countdownEl.parentElement.style.color = "var(--danger)";
        countdownEl.parentElement.style.background = "var(--danger-bg)";
        countdownEl.parentElement.style.border = "1px solid rgba(229, 91, 91, 0.2)";
        countdownEl.parentElement.style.boxShadow = "0 4px 20px rgba(229, 91, 91, 0.15)";
    }

    // Click handler for modal button
    resetBtn.addEventListener("click", startNewWeek);

    // Check if everything is successfully finished ahead of time
    function checkWeeklyCompletion() {
        const allCompleted = tasks.length > 0 && tasks.every(t => t.completed);
        if (allCompleted && weekActive) {
            showResultModal(true);
        }
    }

    // Countdown logic
    function updateCountdown() {
        if (!weekActive) return;

        const now = Date.now();
        const diff = weekEndTime - now;

        if (diff <= 0) {
            // Time has run out
            countdownEl.innerText = "00d 00h 00m 00s";
            
            // Highlight timer in solid red
            countdownEl.parentElement.style.color = "white";
            countdownEl.parentElement.style.background = "var(--danger)";
            
            weekActive = false;
            
            const allCompleted = tasks.length > 0 && tasks.every(t => t.completed);
            
            if (!allCompleted) {
                showResultModal(false);
            }
            return;
        }

        // Format time
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        countdownEl.innerText = `${days}d ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }

    // Show End of Week / Achievement Modal
    function showResultModal(isSuccess) {
        if (isSuccess) {
            modalIcon.innerText = "🏆";
            modalTitle.innerText = "Mission Accomplished!";
            modalMessage.innerText = "You have executed perfectly. All tasks for the week are completed.";
            
            modalPunishmentBox.innerText = "Reward: Enjoy your free time guilt-free.";
            modalPunishmentBox.style.color = "var(--success)";
            modalPunishmentBox.style.background = "var(--success-bg)";
            modalPunishmentBox.style.borderColor = "rgba(69, 178, 107, 0.3)";
            
            resetBtn.innerText = "Start Early / Next Mission";
        } else {
            modalIcon.innerText = "⚠️";
            modalTitle.innerText = "Failure Detected.";
            modalMessage.innerText = "You failed to complete your required tasks for the week. Discipline was lacking.";
            
            modalPunishmentBox.innerText = "PUNISHMENT: NO PHONE FOR 24 HOURS";
            modalPunishmentBox.style.color = "var(--danger)";
            modalPunishmentBox.style.background = "var(--danger-bg)";
            modalPunishmentBox.style.borderColor = "rgba(229, 91, 91, 0.3)";
            
            resetBtn.innerText = "Accept Punishment & Restart";
        }

        modalOverlay.classList.add("active");
    }

    // Run init
    init();
});
