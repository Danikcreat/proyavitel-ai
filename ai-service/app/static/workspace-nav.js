const chat = document.querySelector('#chat-workspace');
const quality = document.querySelector('#quality-workspace');
const chatButton = document.querySelector('#show-chat');
const qualityButton = document.querySelector('#show-quality');
function selectWorkspace() {
  const selected = location.hash === '#quality';
  chat.hidden = selected;
  quality.hidden = !selected;
  chatButton.setAttribute('aria-pressed', String(!selected));
  qualityButton.setAttribute('aria-pressed', String(selected));
}
chatButton.addEventListener('click', () => { location.hash = 'chat'; });
qualityButton.addEventListener('click', () => { location.hash = 'quality'; });
document.querySelector('#new-chat').addEventListener('click', () => { location.hash = 'chat'; });
document.querySelector('#conversations').addEventListener('click', event => {
  if (event.target.closest('button')) location.hash = 'chat';
});
window.addEventListener('hashchange', selectWorkspace);
selectWorkspace();
