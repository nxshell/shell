<template>
    <option :value="value">{{ label }}</option>
</template>

<script>
export default {
    name: "PtSelectOption",
    props: {
        label: String,
        value: String | Number
    }
}
</script>
