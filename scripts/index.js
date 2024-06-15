
import { CreateWebWorkerMLCEngine  } from 'https://esm.run/@mlc-ai/web-llm'

const SELECTED_MODEL = 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC'

const engine = await CreateWebWorkerMLCEngine(
  new Worker('../workers/loadModelAI.js', { type: 'module' }),
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

let messages = []

let flagMessageOff = false

$form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (flagMessageOff) return

  const messageText = $input.value.trim()

  if (messageText !== '') {
    $input.value = ''
  }

  addMessage(messageText, 'user')
  flagMessageOff = true
  $buttonSend.setAttribute('disabled', true)

  const userMessage = {
    role: 'user',
    content: messageText
  }

  messages.push(userMessage)

  const chunks = await engine.chat.completions.create({
    messages,
    stream: true
  })
  
  let reply = ""

  const $newMessage = addMessage("", 'bot')

  for await (const chunk of chunks) {
    const choice = chunk.choices[0]
    const content = choice?.delta?.content ?? ""
    reply += content
    $newMessage.textContent = reply
  }

  document.documentElement.scrollTop = document.body.scrollHeight
  
  messages.push({
    role: 'assistant',
    content: reply
  })
  flagMessageOff = false
  $buttonSend.removeAttribute('disabled')
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

  return $newMessage

}

