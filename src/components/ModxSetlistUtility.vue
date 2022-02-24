<template> 
    <div id='ModxLivesetUtility'>
        MODX LIVESET Utility
        <q-file v-model="model" label="Click to pick .x8a file" @input="uploadFile" style="max-width: 300px"/>
        

        <div v-for="bank in banks" :key="bank.index">
            <b>Bank {{bank.index}} : {{ bank.name }}</b>
            <div v-for="page in bank.pages" :key="page.index">
                Page {{page.index}} : {{ page.name }}
                <div v-for="slot in page.slots" :key="slot.index">
                    {{ slot.comment }}
                </div>
            </div>
            <hr>
        </div>
    </div> 
</template>

<script>
import Utility from "../modx_liveset_utility"
import { Buffer } from 'buffer';
import { ref } from 'vue';

export default {
    name: 'ModxLivesetUtility',
    data() {
        return {
            message: "",
            banks : [],
            model: ref(null)
        };
    },
    created() {
        this.utility = new Utility.ModxLivesetUtility();
        this.banks = new Array(8);
        for (let bankIndex = 0; bankIndex < 8; ++bankIndex) {
            this.banks[bankIndex] = { name: "", index:bankIndex + 1, pages:new Array(16) };
            for (let pageIndex = 0; pageIndex < 16; ++pageIndex) {
                this.banks[bankIndex].pages[pageIndex] = { name:"", index: pageIndex + 1, slots:new Array(16) };
                for (let slotIndex = 0; slotIndex < 16; ++slotIndex) {
                    this.banks[bankIndex].pages[pageIndex].slots[slotIndex] = { index: slotIndex + 1, comment: "" };
                }
            }
        }
    },
    methods: {
        uploadFile(file) {
            console.log(this.model);

            const fileObject = file.target.files[0];

            let fileReader = new FileReader();
            fileReader.readAsArrayBuffer(fileObject);

            fileReader.onload = () => {
                this.utility.setX8ADataBuffer(Buffer.from(fileReader.result));

                // debug
                const numOfBanks = this.utility.getNumOfBanks();
                const numOfPages = 16;
                this.message = "";
                for (let bankIndex = 0; bankIndex < numOfBanks; ++bankIndex) {
                    const bankName = this.utility.getBankName(bankIndex);
                    this.banks[bankIndex].name = bankName;
                    for (let pageIndex = 0; pageIndex < numOfPages; ++pageIndex) {
                        const pageName = this.utility.getPageName(bankIndex, pageIndex);
                        this.banks[bankIndex].pages[pageIndex].name = pageName;
                        for (let slotIndex = 0; slotIndex < 16; ++slotIndex) {
                            this.banks[bankIndex].pages[pageIndex].slots[slotIndex].comment = this.utility.getSlotComment(bankIndex, pageIndex, slotIndex);
                        }
                    }
                }
            };
        }
    }
};
</script>

<style>
div {
    text-align: left;
}

</style>