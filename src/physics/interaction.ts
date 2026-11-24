let dragLocked = false
let screenHovered = false

// Plate dragging and scrolling the results wall both need to take over the
// pointer from the camera. Keeping the two flags separate avoids one of them
// unlocking the camera while the other is still active.
export function setCameraLocked(locked: boolean) {
  dragLocked = locked
}

export function setScreenHovered(hovered: boolean) {
  screenHovered = hovered
}

export function isCameraLocked() {
  return dragLocked || screenHovered
}
