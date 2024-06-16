
import { CreateWebWorkerMLCEngine  } from 'https://esm.run/@mlc-ai/web-llm'
import { obtainHour, toggleMessageOff ,flagMessageOff ,$ } from './functionsLogic.js'

const SELECTED_MODEL = 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC'

const $sectionLoader = $('.loader-section')
const $loader = $('#loader')
const $loaderText = $('#loaderText')
const $mainSection = $('.main_section')
toggleMessageOff(true)

const engine = await CreateWebWorkerMLCEngine(
  new Worker('../workers/loadModelAI.js', { type: 'module' }),
  SELECTED_MODEL,
  {
    initProgressCallback: (info) => {
      console.log('progress: ', info)

      const indexStart = info.text.indexOf('[')
      const indexEnd = info.text.indexOf(']')
      const numbers = info.text.slice(indexStart + 1, indexEnd).split('/')
      const percentage = Math.floor(numbers[0] / numbers[1] * 100)
      if (percentage !== NaN) $loader.style.width = `${percentage}%`

      $loaderText.textContent = info.text

      if (info.progress === 1) {
        toggleMessageOff(false)
        $sectionLoader.style.display = 'none'
        $mainSection.hidden = false
      }
    },
  }
)

const $form = $('#form-message')
const $input = $('#input-message')
const $template = $('#message-template')
const $containerChat = $('#container-chat')

let messages = []

$form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (flagMessageOff) return

  const messageText = $input.value.trim()

  if (messageText !== '') {
    $input.value = ''
  }

  addMessage(messageText, 'user')
  toggleMessageOff(true)

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
  toggleMessageOff(false)
})

const addMessage = ( text, sender ) => {
  const clonedTemplate = $template.content.cloneNode(true)
  const $cage = clonedTemplate.querySelector('.main_section_list_cage')

  const $newMessage = $cage.querySelector('.message')
  const $who = $cage.querySelector('.who')
  const $time = $cage.querySelector('.time')
  const $img = $cage.querySelector('.profile-image')

  const timeNow = obtainHour()

  $newMessage.textContent = text
  $who.textContent = sender === 'bot' ? 'ChatAI' : 'You'
  $time.textContent = timeNow
  $cage.classList.add(sender)
  ;(sender === 'bot') ? $img.src = './icons/robot.svg' : $img.src = './icons/user.svg'

  $containerChat.appendChild($cage)

  document.documentElement.scrollTop = document.body.scrollHeight

  return $newMessage

}

