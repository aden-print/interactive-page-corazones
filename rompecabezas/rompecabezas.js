const BOARD_SIZE = 3;
const puzzleBoard = document.getElementById('puzzleBoard');
const imageUpload = document.getElementById('imageUpload');
const message = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');
const backBtn = document.getElementById('backBtn');

let pieces = [];
let placedCount = 0;
let currentImage = null;

// Evento para subir imagen
imageUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    currentImage = e.target.result;
    initPuzzle(currentImage);
    resetBtn.hidden = true;
  };
  reader.readAsDataURL(file);
});

// Reiniciar para intentar otra imagen
resetBtn.addEventListener('click', () => {
  pieces.forEach(p => p.remove());
  pieces = [];
  placedCount = 0;
  puzzleBoard.innerHTML = '';
  message.textContent = '';
  imageUpload.value = '';
  resetBtn.hidden = true;
  currentImage = null;
});

// Botón para volver al index
backBtn.addEventListener('click', () => {
  window.location.href = '../index.html';  // Ajusta ruta si no está en ../
});

function initPuzzle(imageSrc) {
  pieces.forEach(p => p.remove());
  pieces = [];
  placedCount = 0;
  puzzleBoard.innerHTML = '';
  message.textContent = '';

  const boardWidth = puzzleBoard.clientWidth;
  const pieceSize = boardWidth / BOARD_SIZE;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = document.createElement('div');
      piece.classList.add('piece');
      piece.style.width = piece.style.height = pieceSize + 'px';

      piece.style.backgroundImage = `url(${imageSrc})`;
      piece.style.backgroundSize = `${boardWidth}px ${boardWidth}px`;
      piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;

      piece.dataset.correctRow = row;
      piece.dataset.correctCol = col;

      // Posición random para mezclar
      const randX = Math.random() * (boardWidth - pieceSize);
      const randY = Math.random() * (boardWidth - pieceSize);

      piece.style.position = 'absolute';
      piece.style.left = randX + 'px';
      piece.style.top = randY + 'px';

      piece.style.zIndex = 10;

      makeDraggable(piece);

      pieces.push(piece);
      puzzleBoard.appendChild(piece);
    }
  }
}

function makeDraggable(piece) {
  let offsetX = 0, offsetY = 0;
  let dragging = false;

  function getEventPos(e) {
    if (e.touches) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  }

  function onDragStart(e) {
    e.preventDefault();

    // Si la pieza ya está colocada, no permitir arrastrar
    if (piece.classList.contains('placed')) return;

    dragging = true;
    piece.classList.add('dragging');

    const pos = getEventPos(e);
    const rect = piece.getBoundingClientRect();

    offsetX = pos.x - rect.left;
    offsetY = pos.y - rect.top;

    piece.style.zIndex = 1000;
  }

  function onDragMove(e) {
    if (!dragging) return;
    e.preventDefault();

    const pos = getEventPos(e);
    const boardRect = puzzleBoard.getBoundingClientRect();
    const pieceSize = piece.clientWidth;

    let newX = pos.x - boardRect.left - offsetX;
    let newY = pos.y - boardRect.top - offsetY;

    newX = Math.max(0, Math.min(newX, boardRect.width - pieceSize));
    newY = Math.max(0, Math.min(newY, boardRect.height - pieceSize));

    piece.style.left = newX + 'px';
    piece.style.top = newY + 'px';
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    piece.classList.remove('dragging');

    // Poner zIndex estándar sólo si la pieza NO está colocada
    if (!piece.classList.contains('placed')) {
      piece.style.zIndex = 10;
    }

    checkPlacement(piece);
  }

  piece.addEventListener('mousedown', onDragStart);
  piece.addEventListener('touchstart', onDragStart);

  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('touchmove', onDragMove);

  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchend', onDragEnd);
}

function checkPlacement(piece) {
  const boardWidth = puzzleBoard.clientWidth;
  const pieceSize = boardWidth / BOARD_SIZE;

  const correctLeft = piece.dataset.correctCol * pieceSize;
  const correctTop = piece.dataset.correctRow * pieceSize;

  const currentLeft = parseFloat(piece.style.left);
  const currentTop = parseFloat(piece.style.top);

  const tolerance = pieceSize / 4;

  if (
    Math.abs(currentLeft - correctLeft) < tolerance &&
    Math.abs(currentTop - correctTop) < tolerance
  ) {
    // Alinear pieza exactamente en posición correcta
    piece.style.left = correctLeft + 'px';
    piece.style.top = correctTop + 'px';

    piece.classList.add('placed');
    piece.style.cursor = 'default';

    // Evitar que se pueda seguir arrastrando
    piece.removeEventListener('mousedown', null);
    piece.removeEventListener('touchstart', null);

    piece.style.boxShadow = '0 0 25px #00ffea inset';

    // Poner zIndex bajo para que quede atrás de piezas no colocadas
    piece.style.zIndex = 5;

    placedCount++;
    if (placedCount === BOARD_SIZE * BOARD_SIZE) {
      message.textContent = '¡Felicidades! Rompecabezas completado.';
      resetBtn.hidden = false;
    }
  }
}
