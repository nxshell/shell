export const defaultForm = {
	sessType: 'serialport',
	protocal: 'serialport',
	hostName: '',
	system: 'serial',
	group: '',
	baudRate: 115200,
	dataBits: 8,
	stopBits: 1,
	parity: 'none',
	flowControl: 'none',
	port: 'COM1',
	xtermTheme: 'Night_3024',
}

interface IOptionProps {
	label: string
	value: number | string
}

// 波特率
export const baudRateOptions: IOptionProps[] = [
	{
		label: '110',
		value: 110
	},
	{
		label: '300',
		value: 300
	},
	{
		label: '1200',
		value: 1200
	},
	{
		label: '2400',
		value: 2400
	},
	{
		label: '4800',
		value: 4800
	},
	{
		label: '9600',
		value: 9600
	},
	{
		label: '14400',
		value: 14400
	},
	{
		label: '19200',
		value: 19200
	},
	{
		label: '38400',
		value: 38400
	},
	{
		label: '57600',
		value: 57600
	},
	{
		label: '115200',
		value: 115200
	}
]

// 数据位
export const dataBitsOptions: IOptionProps[] = [
	{
		label: '5',
		value: 5
	},
	{
		label: '6',
		value: 6
	},
	{
		label: '7',
		value: 7
	},
	{
		label: '8',
		value: 8
	}
]
// 停止位
export const stopBitsOptions: IOptionProps[] = [
	{
		label: '1',
		value: 1
	},
	{
		label: '2',
		value: 2
	}
]

// 校验方式
export const parityOptions: IOptionProps[] = [
	{
		label: 'none',
		value: 'none'
	},
	{
		label: 'even',
		value: 'even'
	},
	{
		label: 'mark',
		value: 'mark'
	},
	{
		label: 'odd',
		value: 'odd'
	},
	{
		label: 'space',
		value: 'space'
	}
]

// 流控方式
export const flowControlOptions: IOptionProps[] = [
	{
		label: 'none',
		value: 'none'
	},
	{
		label: 'rtscts',
		value: 'rtscts'
	},
	{
		label: 'xon/xoff',
		value: 'xon/xoff'
	}
]
