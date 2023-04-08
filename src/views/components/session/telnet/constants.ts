import { formItem } from '../ssh/xtermTheme'

export const defaultForm = {
	sessType: 'telnet',
	protocal: 'telnet',
	hostName: '',
	system: 'linux',
	group: '',
	hostAddress: '',
	hostTelnetPort: 23,
	...formItem
}
