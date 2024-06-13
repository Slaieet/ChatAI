
import { CreateMLCEngine } from 'https://esm.run/@mlc-ai/web-llm'

const SELECTED_MODEL = 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC'

const engine = await CreateMLCEngine(
  SELECTED_MODEL,
  {
    initProgressCallback: (info) => {
      console.log('progress: ', info)
    }
  }
)

const $ = element => document.querySelector(element)

const $form = $('#form-message')
const $input = $('#input-message')
const $template = $('#message-template')
const $containerChat = $('#container-chat')
const $buttonSend = $('#button-send')

let flagMessageOff = false

$form.addEventListener('submit', (event) => {
  event.preventDefault()
  if (flagMessageOff) return

  const messageText = $input.value.trim()

  if (messageText !== '') {
    $input.value = ''
  }

  addMessage(messageText, 'user')
  flagMessageOff = true
  $buttonSend.setAttribute('disabled', true)

  setTimeout(() => {
    addMessage('pero bueno, que tal bro!', 'bot')
    flagMessageOff = false
    $buttonSend.removeAttribute('disabled')
  }, 2000);
})

const obtainHour = () => {
  const newDate = new Date()
  const hour = newDate.getHours()
  const minute = newDate.getMinutes()

  return `${hour}:${minute}`
}

const addMessage = ( text, sender ) => {
  const clonedTemplate = $template.content.cloneNode(true)
  const $cage = clonedTemplate.querySelector('.main_section_list_cage')

  const $newMessage = $cage.querySelector('.message')
  const $who = $cage.querySelector('.who')
  const $time = $cage.querySelector('.time')

  const timeNow = obtainHour()

  $newMessage.textContent = text
  $who.textContent = sender === 'bot' ? 'ChatAI' : 'You'
  $time.textContent = timeNow
  $cage.classList.add(sender)

  $containerChat.appendChild($cage)

  document.documentElement.scrollTop = document.body.scrollHeight

}

