// Get the elements that need to be manipulated
const showActiveBtn = document.getElementById('show-active-btn');
const activeClassBox = document.getElementById('active-class-box');
const closeActiveBtn = document.getElementById('close-active-btn');

// When you press the arrow button, a blue frame appears
showActiveBtn.addEventListener('click', function() {
  activeClassBox.style.display = 'block';
  showActiveBtn.style.display = 'none'; // Ẩn nút mũi tên khi đã hiện khung
});

// When the close button is pressed, hide the blue frame and show the arrow button again
closeActiveBtn.addEventListener('click', function() {
  activeClassBox.style.display = 'none';
  showActiveBtn.style.display = 'block';
});
const playBtn = document.getElementById('playBtn');
const closeBtn = document.getElementById('closeBtn');
