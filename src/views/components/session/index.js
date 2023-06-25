import SshModal from "./ssh/index.vue"
import FtpModal from "./ftp/index.vue"
import TelnetModal from "./telnet/index.vue"
import SerialModal from "./serial/index.vue"
import VncModal from "./vnc/index.vue"
import LocalShellModal from "./localShell/index.vue"
import initSystemFontList from "./constants/font-list"

export function shellModalInstance(shellType) {
	initSystemFontList()
	switch (shellType) {
		case "ssh":
			return SshModal
		case "ftp":
			return FtpModal
		case "telnet":
			return TelnetModal
		case "serialport":
		case "serial":
			return SerialModal
		case "vnc":
			return VncModal
		case "localShell":
		case "localshell":
			return LocalShellModal
		default:
			return SshModal
	}
}
