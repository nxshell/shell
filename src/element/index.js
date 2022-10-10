import {
    Button,
    Message,
    Select,
    Option,
    OptionGroup,
    Tabs,
    TabPane,
    Switch,
    Form,
    FormItem,
    Input,
    Radio,
    RadioGroup,
    RadioButton,
    Checkbox,
    CheckboxGroup,
    CheckboxButton,
    Descriptions,
    Avatar,
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
        Vue.use(Radio).use(RadioButton).use(RadioGroup)
        Vue.use(Checkbox).use(CheckboxGroup).use(CheckboxButton)
        Vue.use(Descriptions).use(DescriptionsItem)
        Vue.prototype.$message = Message
        Vue.prototype.$ELEMENT = {size: 'small', zIndex: 3000}
    }
}

export default element
