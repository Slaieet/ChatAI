export const obtainHour = () => {
  const newDate = new Date()
  const hour = newDate.getHours()
  const minute = newDate.getMinutes()

  return `${hour}:${minute}`
}

export let flagMessageOff = false;
const $buttonSend = document.querySelector('#button-send')

export const toggleMessageOff = (action) => {
  if (action) {
    flagMessageOff = true
    $buttonSend.setAttribute('disabled', true)
  } else {
    flagMessageOff = false
    $buttonSend.removeAttribute('disabled')
  }
}
