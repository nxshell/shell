export default {
    name: 'protocol',
    title: 'home.profile.base.protocol.title',
    description: 'home.profile.base.protocol.description',
    defaultValue: 'ssh',
    type: 'select',
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