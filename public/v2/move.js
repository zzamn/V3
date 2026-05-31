const div = document.querySelector(".chat");
// Select the header specifically to act as the drag handle
// This is often a cleaner approach than checking targets
const dragHandle = div.querySelector(".header"); // ****** CHANGE: Target the header ******
let offsetX, offsetY;
let isDragging = false;

// --- Helper Function (getCoordinates - unchanged) ---
const getCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.clientX !== undefined && e.clientY !== undefined) {
        return { x: e.clientX, y: e.clientY };
    }
    return null;
};

// --- Event Handlers ---

const dragStart = (e) => {
    // // ---- Alternative: Target Check (If NOT using a specific handle) ----
    // const target = e.target;
    // // Check if the event started on an element we want to leave alone
    // if (target.tagName === 'TEXTAREA' ||
    //     target.tagName === 'BUTTON' ||
    //     target.tagName === 'INPUT' ||
    //     target.tagName === 'SELECT' ||
    //     target.closest('.chat-tab') // Also ignore clicks on tabs
    //     /* Add other selectors if needed */ )
    // {
    //     return; // Do nothing, let the browser handle the click/tap
    // }
    // // ---- End Alternative ----


    isDragging = true;
    const coords = getCoordinates(e);
    if (!coords) return;

    // Calculate offset relative to the main draggable div, NOT the handle
    offsetX = coords.x - div.offsetLeft;
    offsetY = coords.y - div.offsetTop;

    document.addEventListener("mousemove", dragMove);
    document.addEventListener("touchmove", dragMove, { passive: false });
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("touchend", dragEnd);

    // Optional: Add class to the main div for visual feedback
    div.classList.add('dragging'); // Apply class to the main div

    // Prevent text selection ONLY when dragging starts from the handle
    if (e.type === 'mousedown') {
       e.preventDefault();
    }
};

const dragMove = (e) => {
    if (!isDragging) return;

    if (e.type === 'touchmove') {
        e.preventDefault();
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    requestAnimationFrame(() => {
        div.style.left = `${coords.x - offsetX}px`;
        div.style.top = `${coords.y - offsetY}px`;
    });
};

const dragEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;

    document.removeEventListener("mousemove", dragMove);
    document.removeEventListener("touchmove", dragMove, { passive: false });
    document.removeEventListener("mouseup", dragEnd);
    document.removeEventListener("touchend", dragEnd);

    // Optional: Remove dragging class from the main div
    div.classList.remove('dragging');
};

// --- Attach Initial Listeners ---

// ****** CHANGE: Attach listeners ONLY to the drag handle ******
dragHandle.addEventListener("mousedown", dragStart);
dragHandle.addEventListener("touchstart", dragStart, { passive: true }); // Can be passive here

// ****** REMOVE: Original listeners on the main div ******
// div.addEventListener("mousedown", dragStart); // No longer needed
// div.addEventListener("touchstart", dragStart, { passive: true }); // No longer needed