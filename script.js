class FileSystem {
    constructor() {
        //Ensures only one filesystem is there

        if (FileSystem.instance) {
            return FileSystem.instance;
        }

        this.fs = {
            notes: {
                type: "folder",
                content: {
                    "welcome.txt": {
                        type: "file",
                        content:
                            `Hi, I am Maulik.\nFull Stack Web Developer.\nActively seeking new opportunities.
                            \n
                            \nSurprise when you set the year to 2007 in settings!`,
                        modified: new Date().toISOString(),
                    },
                },
            },
            art: {
                type: "folder",
                content: {},
            },
        };

        FileSystem.instance = this;
    }

    saveFile(path, content) {
        const [folder, filename] = path.split("/");

        if (!this.fs[folder]) {
            alert("Please save in notes/ or art/ folder");
            return false;
        }

        if (!filename) {
            alert("Please provide a valid filename.");
            return false;
        }

        this.fs[folder].content[filename] = {
            type: "file",
            content: content,
            modified: new Date().toISOString(),
        };

        return true;
    }

    loadFile(path) {
        const [folder, filename] = path.split("/");
        if (!filename) {
            alert("Invalid file path.");
            return "";
        }
        return this.fs[folder]?.content[filename]?.content || "";
    }

    getStructure() {
        return this.fs;
    }
}

const fileSystem = new FileSystem();

class AppManager {
    static apps = {
        Notepad: {
            create: () => {
                return `
                    <div class="notepad">
                        <div class="toolbar">
                        <button class="save-btn">Save</button>
                        </div>
                        <textarea class="notepad-content"></textarea>
                    </div>`;
            },
            init: (window, readOnly = false) => {
                const textarea = window.querySelector(".notepad-content");
                const saveBtn = window.querySelector(".save-btn");
                const defaultFolder = "notes";

                if (readOnly) {
                    textarea.disabled = true;
                    saveBtn.style.display = "none";
                }

                saveBtn.onclick = () => {
                    showModal(`
                <h3>Save File</h3>
                <input type="text" id="modal-filename" placeholder="filename.txt" />
                <button id="modal-save-btn">Save</button>
            `);

                    document.getElementById("modal-save-btn").onclick = () => {
                        const filename = document
                            .getElementById("modal-filename")
                            .value.trim();
                        if (!filename) {
                            showModal(`
                        <h3>Error</h3>
                        <p>Please enter a filename.</p>
                        <button id="modal-close-btn">Close</button>
                    `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                            return;
                        }

                        const path = `${defaultFolder}/${filename}`;
                        const content = textarea.value;

                        if (fileSystem.saveFile(path, content)) {
                            showModal(`
                                <h3>Success</h3>
                                <p>File saved successfully!</p>
                                <button id="modal-close-btn">Close</button>
                            `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                            windowManager.refreshAppWindow("My Files");
                        } else {
                            showModal(`
                                <h3>Error</h3>
                                <p>Failed to save file. Ensure you are saving in the correct folder.</p>
                                <button id="modal-close-btn">Close</button>
                            `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                        }
                    };
                };
            },
        },
        Paint: {
            create: () => {
                return `
                <div class="paint">
                    <div class="paint-tools">
                    <input type="color" value="#000000">
                    <input type="range" min="1" max="20" value="5">
                    <button class="clear-btn">Clear</button>
                    <button class="save-btn">Save</button>
                    </div> <br>
                    <canvas class="paint-canvas"></canvas>
                </div>`;
            },
            init: (window) => {
                const canvas = window.querySelector(".paint-canvas");
                const ctx = canvas.getContext("2d");

                //Drawing Logic
                //Keeps track if mouse is pressed
                let painting = false;
                //Stores last cursor position
                let lastX, lastY;
                
                //Set canvas size relative to app window
                canvas.width = window.clientWidth - 40;
                canvas.height = window.clientHeight - 100;

                // Getting Coordinates
                //Returns size of canvas relative to viewport
                //map mouse positions from the page → into the canvas coordinate system. 
                function getCoords(e) {
                    const rect = canvas.getBoundingClientRect();
                    if (e.touches) {
                        return {
                            x: e.touches[0].clientX - rect.left,
                            y: e.touches[0].clientY - rect.top
                        };
                    } else {
                        return {
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top
                        };
                    }
                }

                function startDraw(e) {
                    e.preventDefault();
                    painting = true;
                    const { x, y } = getCoords(e);
                    [lastX, lastY] = [x, y];
                }


                function draw(e) {
                    if (!painting) return; 
                    e.preventDefault();

                    const color = window.querySelector('input[type="color"]').value;
                    const size = window.querySelector('input[type="range"]').value;

                    ctx.lineWidth = size;
                    ctx.lineCap = "round";
                    ctx.strokeStyle = color;

                    //From Helper Coordinates
                    const { x, y } = getCoords(e);

                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(x, y);
                    ctx.stroke();

                    [lastX, lastY] = [x, y];
                }

                function endDraw(e){
                    painting = false;
                    ctx.beginPath(); //Reset the drawing path
                }

                 // --- Mouse events (desktop) ---
                canvas.addEventListener("mousedown", startDraw);
                canvas.addEventListener("mousemove", draw);
                canvas.addEventListener("mouseup", endDraw);
                canvas.addEventListener("mouseleave", endDraw);

                // --- Touch events (mobile) ---
                canvas.addEventListener("touchstart", startDraw, false);
                canvas.addEventListener("touchmove", draw, false);
                canvas.addEventListener("touchend", endDraw, false);

                // canvas.onmousedown = (e) => {
                //     painting = true;
                //     const rect = canvas.getBoundingClientRect();
                //     [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
                // };

                // canvas.onmouseup = () => (painting = false);
                // canvas.onmousemove = draw;
                // canvas.onmouseleave = () => (painting = false);

                window.querySelector(".clear-btn").onclick = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                };

                window.querySelector(".save-btn").onclick = () => {
                    showModal(`
                        <h3>Save Drawing</h3>
                        <input type="text" id="modal-filename" placeholder="drawing.png" />
                        <button id="modal-save-btn">Save</button>
                    `);

                    document.getElementById("modal-save-btn").onclick = () => {
                        const filename = document
                            .getElementById("modal-filename")
                            .value.trim();
                        if (!filename) {
                            showModal(`
                                <h3>Error</h3>
                                <p>Please enter a filename.</p>
                                <button id="modal-close-btn">Close</button>
                            `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                            return;
                        }

                        const defaultFolder = "art";
                        const imageData = canvas.toDataURL("image/png");
                        const path = `${defaultFolder}/${filename}`;

                        if (fileSystem.saveFile(path, imageData)) {
                            showModal(`
                            <h3>Success</h3>
                            <p>Image saved successfully!</p>
                            <button id="modal-close-btn">Close</button>
                        `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                            windowManager.refreshAppWindow("My Files");
                        } else {
                            showModal(`
                            <h3>Error</h3>
                            <p>Failed to save image. Ensure you are saving in the correct folder.</p>
                            <button id="modal-close-btn">Close</button>
                        `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                        }
                    };
                };
            },
        },
        Calculator: {
            create: () => {
                return `
            <div class="calculator">
                <input type="text" class="calc-display" readonly value="0">
                <div class="calc-buttons">
                    ${[7, 8, 9, "+"]
                        .map(
                            (btn) =>
                                `<button class="calc-btn" data-value="${btn}">${btn}</button>`
                        )
                        .join("")}
                    <br>
                    ${[4, 5, 6, "-"]
                        .map(
                            (btn) =>
                                `<button class="calc-btn" data-value="${btn}">${btn}</button>`
                        )
                        .join("")}
                    <br>
                    ${[1, 2, 3, "*"]
                        .map(
                            (btn) =>
                                `<button class="calc-btn" data-value="${btn}">${btn}</button>`
                        )
                        .join("")}
                    <br>
                    ${[0, "C", "=", "/"]
                        .map(
                            (btn) =>
                                `<button class="calc-btn" data-value="${btn}">${btn}</button>`
                        )
                        .join("")}
                        </div>
                    </div>`;
            },
            init: (window) => {
                const display = window.querySelector(".calc-display");
                const calculator = new Calculator();

                window.querySelectorAll(".calc-btn").forEach((btn) => {
                    btn.addEventListener("click", () => {
                        const value = btn.dataset.value;
                        display.value = calculator.handleInput(value);
                    });
                });
            },
        },
        Browser: {
            create: () => {
                return `
            <div class="retro-browser">
                <div class="browser-banner">
                    <img src="browserbanner.png" alt="Browser Banner" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div class="browser-toolbar">
                    <input type="text" class="search-bar" placeholder="Search the web..." />
                    <button class="search-btn">Search</button>
                </div>
            </div>
        `;
            },
            init: (appWindow) => {
                const searchBtn = appWindow.querySelector(".search-btn");
                const searchBar = appWindow.querySelector(".search-bar");

                searchBtn.onclick = () => {
                    const query = searchBar.value.trim();
                    if (query === "") {
                        showModal(`
                            <h3>Error</h3>
                            <p>Please enter a search query.</p>
                            <button id="modal-close-btn">Close</button>
                        `);
                        document.getElementById("modal-close-btn").onclick = hideModal;
                        return;
                    }

                    const url =
                        "https://www.google.com/search?q=" + encodeURIComponent(query);
                    window.open(url, "_blank");
                };
            },
        },
        "My Files": {
            create: () => {
                const structure = fileSystem.getStructure();

                return `
                    <div class="file-explorer">
                        ${Object.entries(structure)
                        .map(
                            ([folder, data]) => `
                            <div class="folder">
                                <div class="folder-header">
                                    <img src="icons/file.png" width="32" height="32">
                                    <span>${folder}</span>
                            </div>
                                <div class="folder-content">
                                    ${Object.entries(data.content)
                                    .map(
                                        ([filename, file]) => `
                                        <div class="file-item" data-path="${folder}/${filename}">
                                            <img src="${filename
                                                .toLowerCase()
                                                .endsWith(".png")
                                                ? "icons/picture.png"
                                                : "icons/notepad.png"
                                            }" width="32" height="32">
                                            <span>${filename}</span>
                                        </div>
                                    `
                                    )
                                    .join("")}
                                </div>
                            </div>
                        `
                        )
                        .join("")}
                    </div>`;
            },
            init: (window) => {
                const fileList = window.querySelector(".file-explorer");

                fileList.addEventListener("click", (e) => {
                    const fileItem = e.target.closest(".file-item");
                    if (fileItem) {
                        const path = fileItem.dataset.path;
                        const [folder, ...rest] = path.split("/");
                        const filename = rest.join("/");

                        const extension = filename.split(".").pop().toLowerCase();
                        const imageExtensions = ["png", "jpg", "jpeg", "gif", "bmp"];
                        const textExtensions = ["txt", "md", "js", "html", "css"];

                        if (imageExtensions.includes(extension)) {
                            const imageSrc = fileSystem.loadFile(path);
                            const imageViewerContent =
                                AppManager.apps["Image Viewer"].create(imageSrc);
                            windowManager.createWindow(filename, imageViewerContent);
                        } else if (textExtensions.includes(extension)) {
                            const notepadContent = AppManager.apps.Notepad.create();
                            const notepadWindow = windowManager.createWindow(
                                filename,
                                notepadContent
                            );
                            AppManager.apps.Notepad.init(notepadWindow, true);
                            const textarea = notepadWindow.querySelector(".notepad-content");
                            textarea.value = fileSystem.loadFile(path);
                        }
                    }
                });
            },
        },
        "Image Viewer": {
            create: (imageSrc) => {
                return `
            <div class="image-viewer">
              <img src="${imageSrc}" alt="No file opened" style="max-width: 100%; max-height: 100%;" />
            </div>`;
            },
        },
        GitHub: {
            create: () => {
                window.open("https://www.github.com/maulik-g", "_blank");
                return `<div class="github">Redirecting to GitHub...</div>`;
            },
        },
        LinkedIn: {
            create: () => {
                window.open("https://www.linkedin.com/in/maulikgaur", "_blank");
                return `<div class="linkedin">Redirecting to LinkedIn...</div>`;
            },
        },
        "Mail Me": {
            create: () => {
                const email = "maulikgaur12345@gmail.com"; 
                const subject = encodeURIComponent("Let's Connect(MG Web OS)");
                const body = encodeURIComponent("Hi Maulik,");
                const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;

                return `
                <div class="mail-app">
                    <h3>Contact Me</h3>
                    <p>
                        Email: <strong>${email}</strong>
                    </p>
                    <a href="${gmailLink}" target="_blank" class="send-mail-btn">Send Me Mail</a>
                    <button class="copy-mail-btn">Copy Email</button>
                </div>`;
            },
            init: (appWindow) => {
                const email = "maulikgaur12345@gmail.com";

                // Copy Email button
                appWindow.querySelector(".copy-mail-btn").onclick = async () => {
                    try {
                        await navigator.clipboard.writeText(email);
                        alert("Email copied to clipboard!");
                    } catch (err) {
                        const tempInput = document.createElement("input");
                        tempInput.value = email;
                        document.body.appendChild(tempInput);
                        tempInput.select();
                        document.execCommand("copy");
                        document.body.removeChild(tempInput);
                        alert("Email copied (fallback)!");
                    }
                };
            }
        },
        LeetCode: {
            create: () => {
                window.open("https://www.leetcode.com/maulik-g", "_blank");
                return `<div class="leetcode">Redirecting to LeetCode...</div>`;
            },
        },
        "Resumes": {
            create: () => {
                return `
                <div class="resume">
                    <select id="resumeSelect">
                        <option value="">-- Select Resume --</option>
                        <option value="/assets/resumes/Maulik_Resume.pdf">Web Developer</option>
                    </select>
                    <div style="margin-top:10px;">
                        <button id="zoomIn">+</button>
                        <button id="zoomOut">-</button>
                    </div>
                    <div id="pdfContainer" style="margin-top:10px; width:100%; height:400px; border:1px solid black; overflow:auto;">
                        <p>No PDF loaded</p>
                    </div>
                </div>`;
            },
            init: (win) => {
                const select = win.querySelector("#resumeSelect");
                const container = win.querySelector("#pdfContainer");

                let scale = 1.0;

                const renderPDF = (url) => {
                    container.innerHTML = `<embed src="${url}" type="application/pdf" width="100%" height="100%" />`;
                };

                select.addEventListener("change", () => {
                    if (select.value) {
                        renderPDF(select.value);
                    } else {
                        container.innerHTML = "<p>No PDF loaded</p>";
                    }
                });

                win.querySelector("#zoomIn").addEventListener("click", () => {
                    scale += 0.1;
                    if (select.value) {
                        container.innerHTML = `<embed src="${select.value}" type="application/pdf" width="${100 * scale}%" height="${100 * scale}%" />`;
                    }
                });

                win.querySelector("#zoomOut").addEventListener("click", () => {
                    if (scale > 0.2) {
                        scale -= 0.1;
                        if (select.value) {
                            container.innerHTML = `<embed src="${select.value}" type="application/pdf" width="${100 * scale}%" height="${100 * scale}%" />`;
                        }
                    }
                });
            }
        },
        "Live Projects": {
        create: () => {
            // This is new. It reuses your CSS classes for styling.
            return `
                <div class="file-explorer">
                    <div class="file-list">
                        <div class="file-item" onclick="window.open('https://maulik-g.github.io/ai-voice-agent/', '_blank')">
                            <img src="icons/aura.png" width="32" height="32" alt="Aura AI Voice Agent" />
                            <span>Aura - AI Voice Agent</span>
                        </div>
                        <div class="file-item" onclick="window.open('https://ai-mock-interview-shortlisted.vercel.app/', '_blank')">
                            <img src="icons/shortlisted.svg" width="32" height="32" alt="ShortListed - AI Mock Interview" />
                            <span>ShortListed AI Mock Interview</span>
                        </div>
                    </div>
                </div>
            `;
        },
        init: (window) => {
            // This is new. It opens links instead of loading files.
            const fileList = window.querySelector(".file-explorer");
            fileList.addEventListener("click", (e) => {
                const fileItem = e.target.closest(".file-item");
                if (fileItem) {
                    const link = fileItem.dataset.path;
                    if (link) {
                        window.open(link, "_blank");
                    }
                }
            });
        },
        },
        Game: {
            create: () => {
                return `
                    <div class="game-container">
                        <div class="game-instructions">Press SPACE to start/pause. Use arrow keys to move.</div>
                        <canvas id="snake"></canvas>
                        <div class="mobile-controls">
                            <button class="btn-start">▶ / ⏸</button>
                            <button class="btn-up">▲</button>
                            <div>
                                <button class="btn-left">◀</button>
                                <button class="btn-down">▼</button>
                                <button class="btn-right">▶</button>
                            </div>
                    </div>
                    </div>`;
            },
            init: (window) => {
                const canvas = window.querySelector("#snake");
                if (!canvas) {
                    console.error("Canvas with id 'snake' not found.");
                    return;
                }
                const ctx = canvas.getContext("2d");
                const gridSize = 20;
                let snake = [{ x: 10, y: 10 }];
                let food;
                spawnFood();
                let direction = "right";
                let score = 0;
                let gameRunning = false;
                let gameLoop;

                // Canvas size adapts to window
                let maxSize = Math.min(window.clientWidth - 40, 400);
                maxSize = Math.floor(maxSize / gridSize) * gridSize; // snap to grid
                canvas.width = maxSize;
                canvas.height = maxSize;


                document.addEventListener("keydown", (e) => {
                    if (e.code === "Space" && window.style.zIndex === (windowManager.zIndex - 1).toString()) {
                        e.preventDefault();
                        toggleGame();
                        // gameRunning = !gameRunning;
                        // if (gameRunning) {
                        //     gameLoop = setInterval(() => {
                        //         updateGame();
                        //         drawGame();
                        //     }, 100);
                        // } else {
                        //     clearInterval(gameLoop);
                        // }
                    }
                    if (gameRunning) {
                        switch (e.key) {
                            case "ArrowUp":
                                if (direction !== "down") direction = "up";
                                break;
                            case "ArrowDown":
                                if (direction !== "up") direction = "down";
                                break;
                            case "ArrowLeft":
                                if (direction !== "right") direction = "left";
                                break;
                            case "ArrowRight":
                                if (direction !== "left") direction = "right";
                                break;
                        }
                    }
                });

                 // --- Mobile Touch Controls ---
                const btnStart = window.querySelector(".btn-start");
                const btnUp = window.querySelector(".btn-up");
                const btnDown = window.querySelector(".btn-down");
                const btnLeft = window.querySelector(".btn-left");
                const btnRight = window.querySelector(".btn-right");

                btnStart.addEventListener("click", toggleGame);  
                btnUp.addEventListener("click", () => { if (direction !== "down") direction = "up"; });
                btnDown.addEventListener("click", () => { if (direction !== "up") direction = "down"; });
                btnLeft.addEventListener("click", () => { if (direction !== "right") direction = "left"; });
                btnRight.addEventListener("click", () => { if (direction !== "left") direction = "right"; });

                // Game toggle
                function toggleGame() {
                    gameRunning = !gameRunning;
                    if (gameRunning) {
                        gameLoop = setInterval(() => {
                            updateGame();
                            drawGame();
                        }, 100);
                    } else {
                        clearInterval(gameLoop);
                    }
                }

                function drawGame() {
                    ctx.fillStyle = "black";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.fillStyle = "lime";
                    snake.forEach((segment) => {
                        ctx.fillRect(
                            segment.x * gridSize,
                            segment.y * gridSize,
                            gridSize - 2,
                            gridSize - 2
                        );
                    });

                    ctx.fillStyle = "red";
                    ctx.fillRect(
                        food.x * gridSize,
                        food.y * gridSize,
                        gridSize - 2,
                        gridSize - 2
                    );

                    ctx.fillStyle = "white";
                    ctx.font = "20px Arial";
                    ctx.fillText(`Score: ${score}`, 10, 30);
                }

                function updateGame() {
                    const head = { ...snake[0] };

                    switch (direction) {
                        case "up":
                            head.y--;
                            break;
                        case "down":
                            head.y++;
                            break;
                        case "left":
                            head.x--;
                            break;
                        case "right":
                            head.x++;
                            break;
                    }

                    if (
                        head.x < 0 ||
                        head.x >= canvas.width / gridSize ||
                        head.y < 0 ||
                        head.y >= canvas.height / gridSize
                    ) {
                        return gameOver();
                    }

                    if (
                        snake.some(
                            (segment) => segment.x === head.x && segment.y === head.y
                        )
                    ) {
                        return gameOver();
                    }

                    snake.unshift(head);

                    if (head.x === food.x && head.y === food.y) {
                        score += 10;
                        spawnFood();
                    } else {
                        snake.pop();
                    }
                }

                function spawnFood() {
                    food = {
                        x: Math.floor(Math.random() * (canvas.width / gridSize)),
                        y: Math.floor(Math.random() * (canvas.height / gridSize)),
                    };

                    if (
                        snake.some(
                            (segment) => segment.x === food.x && segment.y === food.y
                        )
                    ) {
                        spawnFood();
                    }
                }

                function gameOver() {
                    clearInterval(gameLoop);
                    showModal(`
                        <h3>Game Over!</h3>
                        <p>Your Score: ${score}</p>
                        <button id="modal-close-btn">Close</button>
                    `);
                    document.getElementById("modal-close-btn").onclick = () => {
                        hideModal();
                        snake = [{ x: 10, y: 10 }];
                        direction = "right";
                        score = 0;
                        spawnFood();
                        drawGame();
                        gameRunning = false;
                    };
                }

                drawGame();
            },
        },
        Chat: {
            create: () => {
                return `
                <p>You can chat with people using my OS</p>
                <div class="chat">
                    <div class="chat-status"></div>
                    <div class="chat-messages"></div>
                    <div class="chat-input-container">
                        <input type="text" class="chat-input" placeholder="Type a message..." />
                        <button class="chat-send">Send</button>
                    </div>
                </div>`;
                },
            init: (window) => {
                const chatStatus = window.querySelector(".chat-status");
                const chatMessages = window.querySelector(".chat-messages");
                const chatInput = window.querySelector(".chat-input");
                const chatSend = window.querySelector(".chat-send");
                let ws;

                function connect() {
                    ws = new WebSocket("wss://mg-os.onrender.com");

                    ws.onopen = () => {
                        chatStatus.innerHTML = "● Connected";
                        chatStatus.style.color = "#0f0";
                        chatSend.disabled = false;
                        chatInput.disabled = false;
                    };

                    ws.onclose = () => {
                        chatStatus.innerHTML = "● Disconnected - Reconnecting...";
                        chatStatus.style.color = "#f00";
                        chatSend.disabled = true;
                        chatInput.disabled = true;
                        setTimeout(connect, 5000);
                    };

                    ws.onmessage = (event) => {
                        try {
                            if (event.data instanceof Blob) {
                                event.data
                                    .text()
                                    .then((text) => {
                                        const data = JSON.parse(text);
                                        addMessage(data.username, data.message);
                                    })
                                    .catch((error) => {
                                        console.error("Error parsing message:", error);
                                    });
                            } else {
                                const data = JSON.parse(event.data);
                                addMessage(data.username, data.message);
                            }
                        } catch (error) {
                            console.error("Error handling message:", error);
                        }
                    };

                    ws.onerror = (error) => {
                        console.error("WebSocket error:", error);
                        chatStatus.innerHTML = "● Error connecting";
                        chatStatus.style.color = "#f00";
                    };
                }

                const userId = Array(4)
                    .fill(0)
                    .map(() => {
                        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        return chars.charAt(Math.floor(Math.random() * chars.length));
                    })
                    .join("");

                function addMessage(username, message) {
                    const messageDiv = document.createElement("div");
                    messageDiv.className = "chat-message";
                    messageDiv.innerHTML = `
                        <span class="chat-username">${username}:</span>
                        <span class="chat-text">${message}</span>
                        <span class="chat-time">${new Date().toLocaleTimeString()}</span>
                    `;
                    chatMessages.appendChild(messageDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }

                function sendMessage() {
                    const message = chatInput.value.trim();
                    if (message && ws.readyState === WebSocket.OPEN) {
                        ws.send(
                            JSON.stringify({
                                type: "message",
                                username: `User [${userId}]`,
                                message: message,
                            })
                        );
                        chatInput.value = "";
                    }
                }

                chatSend.onclick = sendMessage;
                chatInput.onkeypress = (e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                };

                connect();

                return () => {
                    if (ws) {
                        ws.close();
                    }
                };
            },
        },
        Settings: {
            create: () => {
                return `
                <div class="settings">
                    <div class="settings-section">
                        <h3>System Colors</h3>
                        <div class="color-grid">
                            <div class="color-option">
                                <label for="button-color">Button Color:</label>
                                <input type="color" id="button-color" name="button-color" value="#c0c0c0">
                            </div>
                            <div class="color-option">
                                <label for="taskbar-color">Taskbar Color:</label>
                                <input type="color" id="taskbar-color" name="taskbar-color" value="#d2a4a4">
                            </div>
                            <div class="color-option">
                                <label for="window-title-color">Window Title Color:</label>
                                <input type="color" id="window-title-color" name="window-title-color" value="#f2426b">
                            </div>
                            <div class="color-option">
                                <label for="close-btn-color">Close Button Color:</label>
                                <input type="color" id="close-btn-color" name="close-btn-color" value="#eeeb12">
                            </div>
                            <div class="color-option">
                                <label for="min-btn-color">Minimize Button Color:</label>
                                <input type="color" id="min-btn-color" name="min-btn-color" value="#c0c0c0">
                            </div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>Date & Time</h3>
                        <div class="date-settings">                            
                            <label for="custom-year">Set Year:</label>
                            <input type="number" id="custom-year" min="1970" max="2100" value="2000">
                        </div>
                    </div>
                    <button id="save-settings-btn">Save Settings</button>
                </div>`;
            },
            init: (window) => {
                const inputs = {
                    buttonColor: window.querySelector("#button-color"),
                    taskbarColor: window.querySelector("#taskbar-color"),
                    windowTitleColor: window.querySelector("#window-title-color"),
                    closeBtnColor: window.querySelector("#close-btn-color"),
                    minBtnColor: window.querySelector("#min-btn-color"),
                    customYear: window.querySelector("#custom-year"),
                };

                const saveBtn = window.querySelector("#save-settings-btn");

                saveBtn.onclick = () => {
                    Object.entries(inputs).forEach(([key, input]) => {
                        updateColor(key, input.value);
                    });

                    checkMG(inputs.customYear.value);

                    showModal(`
                        <h3>Success</h3>
                        <p>Settings have been saved.</p>
                        <button id="modal-close-btn">Close</button>
                    `);
                    document.getElementById("modal-close-btn").onclick = hideModal;
                };

                function updateColor(key, value) {
                    const cssVarMap = {
                        buttonColor: "--button-color",
                        taskbarColor: "--taskbar-color",
                        windowTitleColor: "--window-title-color",
                        closeBtnColor: "--close-btn-color",
                        minBtnColor: "--min-btn-color",
                    };

                    if (cssVarMap[key]) {
                        document.documentElement.style.setProperty(cssVarMap[key], value);
                    }
                }

                function checkMG(year) {
                    if (year === "2007") {
                        triggerMGEvent();
                    }
                }

                function triggerMGEvent() {
                    const errors = [
                        "CRITICAL ERROR: System time corruption detected",
                        "WARNING: Date overflow imminent",
                        "FATAL ERROR: Memory allocation failed",
                        "ERROR: Operating system crash detected",
                        "SYSTEM FAILURE: Time paradox detected",
                    ];
                    let errorIndex = 0;

                    function showNextError() {
                        if (errorIndex < errors.length) {
                            showModal(`
                                <h3 class="error-title">SYSTEM ERROR</h3>
                                <p>${errors[errorIndex]}</p>
                                <div class="error-code">Code: MG-${Math.floor(Math.random() * 9999)}</div>
                            `);
                            const errorSound = new Audio("sfx/error.mp3");
                            errorSound.play().catch(() => {});
                            errorIndex++;
                            setTimeout(showNextError, 1000);
                        } else {
                            hideModal();
                            startEvent();
                        }
                    }

                    function startEvent() {
                        document.body.innerHTML = `
                            <div id="surprise-screen" class="window surprise-window">
                                <div class="title-bar">
                                    <div class="title-bar-text">System Alert</div>
                                </div>
                                <div class="window-body surprise-body">
                                    <video width="640" height="360" controls autoplay loop playsinline>
                                        <source src="/assets/surprise.mp4" type="video/mp4" >
                                        Your browser does not support the video tag.
                                    </video>
                                    <div id="restart-wrapper" class="restart-wrapper">
                                        <button class="restart-btn">Restart System</button>
                                    </div>
                                </div>
                            </div>
                        `;

                        // restart button shows up after 6s
                        setTimeout(() => {
                            document.getElementById("restart-wrapper").style.display = "block";
                            document.querySelector(".restart-btn").onclick = () => location.reload();
                        }, 6000);
                    }

                    // start the chain of errors
                    showNextError();
                }
            }
        }
    } //Settings
} //App Manager
class Calculator {
    constructor() {
        this.display = "";
        this.previousValue = null;
        this.operation = null;
        this.newNumber = true;
    }

    clear() {
        this.display = "";
        this.previousValue = null;
        this.operation = null;
        this.newNumber = true;
        return "0";
    }

    calculate() {
        if (this.previousValue === null || this.operation === null)
            return this.display;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.display);
        let result = 0;

        switch (this.operation) {
            case "+":
                result = prev + current;
                break;
            case "-":
                result = prev - current;
                break;
            case "*":
                result = prev * current;
                break;
            case "/":
                result = current !== 0 ? prev / current : "Error";
                break;
        }

        this.previousValue = null;
        this.operation = null;
        this.newNumber = true;
        return result.toString();
    }

    handleInput(value) {
        if (value === "C") {
            return this.clear();
        }

        if (value === "=") {
            this.display = this.calculate();
            return this.display;
        }

        if ("+-*/".includes(value)) {
            if (this.previousValue !== null) {
                this.display = this.calculate();
            }
            this.previousValue = this.display;
            this.operation = value;
            this.newNumber = true;
            return this.display;
        }

        if (this.newNumber) {
            this.display = value;
            this.newNumber = false;
        } else {
            this.display += value;
        }
        return this.display;
    }
}

//Class to create the Window
//WindowManager is engine that creates movable windows
//Using DOM Manipulation
class WindowManager {
    constructor() {
        this.windows = new Map();
        //Moves to top 
        this.zIndex = 100;
    }

    //Window Effect of opening up
    createWindow(title, content) {
        //Using DOM Manipulation
        const win = document.createElement("div");
        win.className = "window";
        win.style.zIndex = this.zIndex++;
        win.style.left = "300px";
        win.style.top = "50px";

        // Center the element
        // win.style.left = '50%';
        // win.style.top = '50%';
        // win.style.transform = 'translate(-50%, -50%)';

        win.innerHTML = `
            <div class="window-title">
                <span>${title}</span>
                <div class="window-controls">
                    <div class="window-button minimize-button"></div>
                    <div class="window-button close-button"></div>
                </div>
            </div>
            <div class="window-content">${content}</div>
        `;

        //Appends window to desktop(big div)
        document.getElementById("desktop").appendChild(win);
        //Defined to make it draggable
        this.makeDraggable(win);
        //Minimize and Close
        this.setupControls(win);
        //Registers in the map
        this.windows.set(win, title);

        if (AppManager.apps[title]?.init) {
            AppManager.apps[title].init(win);
        }

        return win;
    }

    makeDraggable(win) {
        //Finds window title, so we drag by only title bar
        const title = win.querySelector(".window-title");
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;

        //To give choppy movements
        //Gives retro choppy effect
        let dragTimeout = null;

        //When we click on title bar
        //Mouse Event Listener
        title.onmousedown = dragMouseDown;

        const self = this;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDragChoppy;
            win.style.zIndex = self.zIndex++;
        }

        function elementDrag(e) {
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            win.style.top = win.offsetTop - pos2 + "px";
            win.style.left = win.offsetLeft - pos1 + "px";
        }

        //Drag Effect with 50ms
        function elementDragChoppy(e) {
            if (!dragTimeout) {
                dragTimeout = setTimeout(() => {
                    elementDrag(e);
                    dragTimeout = null;
                }, 50);
            }
        }

        //Runs when mouse is released
        //Stops listening to mouse move
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            if (dragTimeout) {
                clearTimeout(dragTimeout);
                dragTimeout = null;
            }
        }
    }

    //Close and Minimize Buttons 
    setupControls(win) {
        win.querySelector(".close-button").onclick = () => {
            //Gets from map made in Window Manager class
            const title = this.windows.get(win);
            //Removes from window div from DOM completely
            win.remove();

            //Removes from map, to avoid memory leaks
            this.windows.delete(win);

            const icon = document.querySelector(`.icon[data-app="${title}"]`);
            if (icon) {
                icon.style.backgroundColor = "";
            }
        };

        win.querySelector(".minimize-button").onclick = () => {
            //Makes it invisible
            //But still present in DOM
            win.style.display = "none";
        };
    }

    //Refresh Windows and replace HTML 
    refreshAppWindow(appName) {
        //For all windows opened in windows Map
        //title -> title and win -> DOM element
        this.windows.forEach((title, win) => {
            if (title === appName) {
                win.querySelector(".window-content").innerHTML =
                    // Select window content and replace HTML with fresh generated
                    AppManager.apps[appName].create();
                    //Calls init to reinitialize after refreshing
                    AppManager.apps[appName].init(win);
            }
        });
    }
}

const windowManager = new WindowManager();

const desktopIcons = [
    { name: "My Files", icon: "icons/file.png" },
    { name: "Browser", icon: "icons/browser.png" },
    { name: "Notepad", icon: "icons/notepad.png" },
    { name: "Paint", icon: "icons/paint.png" },
    // { name: "Image Viewer", icon: "icons/picture.png" },
    { name: "Chat", icon: "icons/chat.png" },
    { name: "Calculator", icon: "icons/calculator.png" },
    { name: "LinkedIn", icon: "icons/linkedin.png" },
    { name: "GitHub", icon: "icons/github.png" },
    { name: "LeetCode", icon: "icons/leetcode.png" },
    { name: "Game", icon: "icons/snake.png" },
    { name: "Live Projects", icon: "icons/file.png" },
    { name: "Resumes", icon: "icons/resumes.png" },
    { name: "Settings", icon: "icons/gear.png" },
    { name: "Mail Me", icon: "icons/mail.png" },
];

const iconsPerColumn = 5;
const columns = Math.ceil(desktopIcons.length / iconsPerColumn);

document.getElementById("desktop").innerHTML = Array(columns)
    .fill()
    .map(
        (_, colIndex) => `
        <div class="icon-column" style="position: absolute; left: ${colIndex * 100
            }px;">
            ${desktopIcons
                .slice(colIndex * iconsPerColumn, (colIndex + 1) * iconsPerColumn)
                .map(
                    ({ name, icon }) => `
                    <div class="icon" data-app="${name}">
                        <div class="icon-image" style="background-image: url('${icon}')"></div>
                        <span>${name}</span>
                    </div>
                `
                )
                .join("")}
        </div>
    `
    )
    .join("");

document.querySelectorAll(".icon").forEach((icon) => {
    icon.addEventListener("click", () => {
        const appName = icon.dataset.app;
        let existingWindow = null;

        windowManager.windows.forEach((win, title) => {
            if (title === appName) {
                existingWindow = win;
            }
        });

        if (existingWindow) {
            existingWindow.style.display = "block";
            existingWindow.style.zIndex = windowManager.zIndex++;
        } else {
            const app = AppManager.apps[appName];
            let content = app.create();

            icon.style.backgroundColor = "rgba(255,255,255,0.2)";
            windowManager.createWindow(appName, content);
        }
    });
});

//Show the Modal
function showModal(contentHTML) {
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = contentHTML;
    modal.style.display = "block";
}

//Hiding the Modal
function hideModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
}

document.getElementById("modal-close").onclick = hideModal;

window.onclick = function (event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
        hideModal();
    }
};

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const defaultDate = new Date(now);
    defaultDate.setFullYear(2005);
    const date = window.customDate || defaultDate.toLocaleDateString();
    document.querySelector(".taskbar-right").innerHTML = `
        <div>${time}</div>
        <div>${date}</div>
    `;
}


const copyright = document.createElement("span");
copyright.className = "copyright-text";
copyright.innerHTML = "&copy; 2025 Maulik Gaur. All Rights Reserved.";
document.getElementById("taskbar").appendChild(copyright);

const taskbarRight = document.createElement("div");
taskbarRight.className = "taskbar-right";
document.getElementById("taskbar").appendChild(taskbarRight);

setInterval(updateClock, 1000);
updateClock();

function openWelcomeFile() {
    const path = "notes/welcome.txt";
    const content = fileSystem.loadFile(path);

    const notepadContent = AppManager.apps.Notepad.create();
    const notepadWindow = windowManager.createWindow("Welcome", notepadContent);
    const textarea = notepadWindow.querySelector(".notepad-content");

    textarea.value = content;
    AppManager.apps.Notepad.init(notepadWindow, true);
}

//Getting the Text
const bootScreen = document.getElementById("boot-screen");
let bootText = bootScreen.innerHTML;
//Making it empty screen
bootScreen.innerHTML = "";


//Typing Effect
let charIndex = 0;
const typeSpeed = 1;

function typeText() {
    if (charIndex < bootText.length) {
        bootScreen.innerHTML += bootText.charAt(charIndex);
        charIndex++;
        setTimeout(typeText, typeSpeed);
    } else {
        const boot = new Audio("sfx/boot.mp3");
        setTimeout(() => {
            bootScreen.classList.add("fade-out");
            boot.play();
            //Open File after 1500ms
            setTimeout(openWelcomeFile, 15);
        }, 1000);
    }
}

setTimeout(typeText, 500);
