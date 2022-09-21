<template>
    <div
        class="pt-file"
        @dragenter.stop.prevent
        @dragover.stop.prevent
        @drop.stop.prevent="handleFileDrop"
    >
        <input type="file"
            :accept="accept ? accept: '*'"
            :multiple="!!multi"
            style="display: none"
            ref="file"
            @change="handleFileOpen">
        <slot>
            <pt-inputbox v-model="fileNames" readonly/>
            <pt-button type="primary" size="small" plain @click="openFile">{{T("Select")}}</pt-button>
        </slot>
    </div>
</template>

<script>
export default {
    name: "PtFile",
    props: [
        "value",
        "type",  // bytes(ArrayBuffer), text(String), file 
        "multi",
        "accept"
    ],
    
    data() {
        return {
            fileNames: ""
        }
    },

    methods: {
        openFile() {
            this.$refs.file.click();
        },

        async toFile(fileList) {
            return await this.transform(fileList, async (file) => {
                return await Promise.resolve(file);
            });
        },

        async transform(files, transFunc) {
            console.log(files);
            let count = !!this.multi ? files.length : 1;
            let ret = [];
            let fileNames = [];
            for (let i = 0; i < count; i++) {
                let rawFile = files[i];
                let destFile = {
                    name: rawFile.name,
                    size: rawFile.size,
                    data: await transFunc(rawFile)
                };
                ret.push(destFile);
                fileNames.push(rawFile.name);
            }
            this.fileNames = fileNames.join(";");
            return ret;
        },

        async toBytes(fileList) {
            return await this.transform(fileList, async (file) => {
                return await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve(e.target.result);
                    };
                    reader.readAsArrayBuffer(file);
                });
            });
        },

        async toString(fileList) {
            return await this.transform(fileList, async (file) => {
                return await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve(e.target.result);
                    };
                    reader.readAsText(file);
                }); 
            });
        },

        handleFileDrop(e) {
            this.fileSelcted(e.dataTransfer.files)
        },

        handleFileOpen() {
            console.log("opend", this.$refs.file.files)
            if (this.$refs.file.files.length === 0) {
                return;
            }
            this.fileSelcted(this.$refs.file.files);
        },

        async fileSelcted(files) {
            let ret;
            switch (this.type) {
                case "bytes":
                    ret = await this.toBytes(files);
                    break;
                case "text":
                    ret = await this.toString(files);
                    break;
                case "file":
                default:
                    ret = await this.toFile(files);
            }

            this.$emit("input", ret);
        }
    }
}
</script>

<style lang="scss">
.pt-file {
    position: relative;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .pt-inputbox {
        flex-grow: 1;
    }

    .pt-button {
        flex-shrink: 1;
        width: 60px;
        min-width: 60px;
        height: 26px;
    }
}
</style>