export const defaultValue = 'ssh'
export const protocol = {
    name: 'protocol',
    title: 'home.profile.base.protocol.title',
    description: 'home.profile.base.protocol.description',
    defaultValue: defaultValue,
    options: [
        {
            label: 'SSH',
            value: 'ssh'
        },
        {
            label: 'FTP',
            value: 'ftp'
        },
        {
            label: 'Serial',
            value: 'serialport'
        },
        {
            label: 'Telnet',
            value: 'telnet'
        },
        {
            label: 'LocalShell',
            value: 'localshell'
        },
        {
            label: 'VNC',
            value: 'vnc'
        }
    ]
}