
import { CreateWebWorkerMLCEngine  } from 'https://esm.run/@mlc-ai/web-llm'
import { obtainHour, toggleMessageOff ,flagMessageOff ,$ } from './functionsLogic.js'

const SELECTED_MODEL = 'gemma-2b-it-q4f16_1-MLC-1k'

const $sectionLoader = $('.loader-section')
const $loaderCage = $('#loader-cage')
const $loader = $('#loader')
const $loaderText = $('#loaderText')
const $mainSection = $('.main_section')
toggleMessageOff(true)

const engine = await CreateWebWorkerMLCEngine(
  new Worker('../workers/loadModelAI.js', { type: 'module' }),
  SELECTED_MODEL,
  {
    initProgressCallback: (info) => {
      const { progress } = info
      const percentage = Math.floor(progress * 100)
      $loader.style.width = `${percentage}%`

      $loaderText.textContent = info.text

      if (info.text.includes('Loading')) {
        $loaderCage.style.display = 'none'
      }

      if (info.text.includes('Finish')) {
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

