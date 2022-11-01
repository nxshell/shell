import {
	Button,
	Message,
	MessageBox,
    Notification,
    Loading,
	Select,
	Option,
	OptionGroup,
	Tabs,
	TabPane,
	Switch,
	Form,
	FormItem,
	Input,
	InputNumber,
	Radio,
	RadioGroup,
	RadioButton,
	Checkbox,
	CheckboxGroup,
	CheckboxButton,
	Descriptions,
	Avatar,
	Dialog,
	Tooltip,
	Tag,
	Dropdown,
	Popover,
	DropdownItem,
	DropdownMenu,
	Scrollbar,
	Progress,
	Divider,
	Alert,
	Empty,
	Tree,
	DescriptionsItem
} from 'element-ui'

const element = {
	install: function (Vue) {
		Vue.use(Avatar)
		Vue.use(Button)
		Vue.use(Select).use(Option).use(OptionGroup)
		Vue.use(Tabs).use(TabPane)
		Vue.use(Switch)
		Vue.use(Form).use(FormItem)
		Vue.use(Input)
		Vue.use(InputNumber)
		Vue.use(Dialog)
		Vue.use(Alert)
		Vue.use(Scrollbar)
		Vue.use(Tooltip)
		Vue.use(Tag)
		Vue.use(Popover)
		Vue.use(Tree)
		Vue.use(Empty)
		Vue.use(Divider)
		Vue.use(Progress)
		Vue.use(Dropdown).use(DropdownItem).use(DropdownMenu)
		Vue.use(Radio).use(RadioButton).use(RadioGroup)
		Vue.use(Checkbox).use(CheckboxGroup).use(CheckboxButton)
		Vue.use(Descriptions).use(DescriptionsItem)
        Vue.prototype.$loading = Loading.service;
        Vue.prototype.$msgbox = MessageBox;
        Vue.prototype.$alert = MessageBox.alert;
        Vue.prototype.$prompt = MessageBox.prompt;
        Vue.prototype.$notify = Notification;
        Vue.prototype.$message = Message;
		Vue.prototype.$confirm = MessageBox.confirm
		Vue.prototype.$ELEMENT = Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 }
	}
}

export default element
