// content.js
// Listens for messages from the web app (localhost)
window.addEventListener("message", (event) => {
    // Verify origin (optional but good practice)
    // if (event.origin !== "http://localhost:5173") return;

    if (event.data.type === "EDU_TRACKER_FOCUS") {
        console.log("Content Script received FOCUS request:", event.data);

        // Relay to background.js
        chrome.runtime.sendMessage({
            type: event.data.payload ? "START_FOCUS" : "STOP_FOCUS"
        });
    }
});
