import { basicLight } from 'cm6-theme-basic-light'
import { basicDark } from 'cm6-theme-basic-dark'
import { solarizedDark } from 'cm6-theme-solarized-dark'
import { solarizedLight } from 'cm6-theme-solarized-light'
import { nord } from 'cm6-theme-nord'
import { gruvboxLight } from 'cm6-theme-gruvbox-light'
import { gruvboxDark } from 'cm6-theme-gruvbox-dark'

const themes = [
  {
    extension: basicLight,
    name: 'Basic Light'
  },
  {
    extension: basicDark,
    name: 'Basic Dark'
  },
  {
    extension: solarizedLight,
    name: 'Solarized Light'
  },
  {
    extension: solarizedDark,
    name: 'Solarized Dark'
  },
  {
    extension: nord,
    name: 'Nord'
  },
  {
    extension: gruvboxLight,
    name: 'Gruvbox Light'
  },
  {
    extension: gruvboxDark,
    name: 'Gruvbox Dark'
  }
]

export default themes